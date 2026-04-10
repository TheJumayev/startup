package com.example.backend.Controller;

import com.example.backend.DTO.SekretarImageDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/schedule-list-controller")
@RequiredArgsConstructor
public class ScheduleListController {
    private final GroupsRepo groupsRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;
    private final StudentRepo studentRepo;
    private final ScheduleListRepo scheduleListRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final SubjectRepo subjectRepo;
    private final AttendanceOfflineRepo attendanceOfflineRepo;
    private final AttachmentRepo attachmentRepo;
    private final SuperGroupRepo superGroupRepo;

    private final OnlineStudentWeekDayRepo onlineStudentWeekDayRepo;

//    @GetMapping("/admin/get-all/{date}")
//    public ResponseEntity<?> getAlLForAdminByDate(
//            @PathVariable(required = false) LocalDate date
//    ) {
//
//        // 1️⃣ Agar date kelmasa → bugun
//        LocalDate targetDate = (date != null) ? date : LocalDate.now();
//
//        // 2️⃣ UTC start of day → timestamp
//        long startOfDayUtc = targetDate
//                .atStartOfDay(ZoneId.of("UTC"))
//                .toEpochSecond();
//
//        String lessonDateTimestamp = String.valueOf(startOfDayUtc);
//
//        // 3️⃣ DB dan olish
//        List<ScheduleList> schedules =
//                scheduleListRepo.findAllByLessonDate(lessonDateTimestamp);
//
//        return ResponseEntity.ok(schedules);
//    }

    @GetMapping("/admin/get-all/{date}")
    public ResponseEntity<?> getAlLForAdminByDate(
            @PathVariable(required = false) LocalDate date
    ) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        long startOfDayUtc = targetDate
                .atStartOfDay(ZoneId.of("UTC"))
                .toEpochSecond();

        String lessonDateTimestamp = String.valueOf(startOfDayUtc);

        List<ScheduleList> schedules =
                scheduleListRepo.findAllByLessonDate(lessonDateTimestamp);

        for (ScheduleList schedule : schedules) {

            List<AttendanceOffline> attendances =
                    attendanceOfflineRepo.findAllByScheduleListId(schedule.getId());

            if (attendances.isEmpty()) {
                schedule.setIsChecked(0);
                schedule.setIsOnlineChecked(0);
                continue;
            }

            /* =================== ALL STUDENTS =================== */

            boolean anyUnchecked = false;

            for (AttendanceOffline ao : attendances) {
                if (ao.getIsPresent() == null || ao.getIsPresent() == 0) {
                    anyUnchecked = true;
                    break;
                }
            }

            if (anyUnchecked) {
                schedule.setIsChecked(1);
            } else {
                schedule.setIsChecked(2);
            }

            /* =================== ONLINE STUDENTS =================== */

            List<AttendanceOffline> onlineList = attendances.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getTodayOnline()))
                    .toList();

            if (onlineList.isEmpty()) {
                schedule.setIsOnlineChecked(0);
            } else {

                boolean anyOnlineUnchecked = false;

                for (AttendanceOffline ao : onlineList) {
                    if (ao.getIsPresent() == null || ao.getIsPresent() == 0) {
                        anyOnlineUnchecked = true;
                        break;
                    }
                }

                if (anyOnlineUnchecked) {
                    schedule.setIsOnlineChecked(1);
                } else {
                    schedule.setIsOnlineChecked(2);
                }
            }

            scheduleListRepo.save(schedule); // agar persist qilish kerak bo‘lsa
        }

        return ResponseEntity.ok(schedules);
    }


    @GetMapping("/update")
    public ResponseEntity<?> updateScheduleList() {
        System.out.print("start-work");

        List<TokenHemis> tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }

        String token = tokens.get(tokens.size() - 1).getName();
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);


        long lessonDateFrom = todayStartPlusOneHourUtc();
        long lessonDateTo = todayEnd();
//        long lessonDateFrom = 1769731200;
//        long lessonDateTo = todayEnd();

        int currentPage = 1;
        int saved = 0;




        try {
            while (true) {

                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/schedule-list",
                        HttpMethod.GET,
                        headers,
                        Map.of(
                                "page", currentPage,
                                "lesson_date_from", lessonDateFrom,
                                "lesson_date_to", lessonDateTo
                        ),
                        null
                );

                Map<?, ?> body = (Map<?, ?>) response.getBody();
                Map<?, ?> data = (Map<?, ?>) body.get("data");
                List<Map<String, Object>> items =
                        (List<Map<String, Object>>) data.get("items");

                if (items.isEmpty()) break;

                for (Map<String, Object> item : items) {
                    boolean savedOne = saveScheduleItem(item);
                    if (savedOne) saved++;
                }

                Map<?, ?> pagination = (Map<?, ?>) data.get("pagination");
                int pageCount = (int) pagination.get("pageCount");
                if (currentPage >= pageCount) break;

                currentPage++;
            }

            return ResponseEntity.ok("✅ Today schedules saved: " + saved);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error: " + e.getMessage());
        }
    }



    private long todayStartPlusOneHourUtc() {
        return LocalDate.now(ZoneId.of("UTC"))
                .atStartOfDay(ZoneId.of("UTC"))
                .plusHours(1)
                .toEpochSecond();
    }


    private long todayEnd() {
        return LocalDate.now()
                .atTime(23, 59, 59)
                .atZone(ZoneId.systemDefault())
                .toEpochSecond();
    }



    private boolean saveScheduleItem(Map<String, Object> item) {

        Integer hemisId = (Integer) item.get("id");

        // 🔁 Agar oldin saqlangan bo‘lsa — skip
        if (scheduleListRepo.existsByHemisId(hemisId)) return false;

        /* ================= GROUP ================= */

        Map<String, Object> groupMap = (Map<String, Object>) item.get("group");
        Groups group = groupsRepo.findGroupByHemisId((Integer) groupMap.get("id"));
        if (group == null) return false;

        UUID groupId = group.getId();

        /* ================= SUPER GROUP LOGIC ================= */

        List<SuperGroup> allSuperGroups = superGroupRepo.findAll();

        // 1️⃣ Agar group subGroup bo‘lsa — ignore qilamiz
        boolean isSubGroup = allSuperGroups.stream()
                .anyMatch(sg -> sg.getSubGroups()
                        .stream()
                        .anyMatch(sub -> sub.getId().equals(groupId)));

        if (isSubGroup) {
            return false;
        }

        // 2️⃣ Agar group mainGroup bo‘lsa
        Optional<SuperGroup> mainSuperGroup = allSuperGroups.stream()
                .filter(sg -> sg.getMainGroup().getId().equals(groupId))
                .findFirst();

        /* ================= SUBJECT + SEMESTER ================= */

        Map<String, Object> subjectMap = (Map<String, Object>) item.get("subject");
        Map<String, Object> semesterMap = (Map<String, Object>) item.get("semester");

        Integer subjectId = (Integer) subjectMap.get("id");
        Subject subject = subjectRepo.findByHemisId(subjectId).orElse(null);
        if (subject == null) return false;

        String semesterCode = semesterMap.get("code").toString();
        String semesterName = semesterMap.get("name").toString();

        Map<String, Object> auditorium = (Map<String, Object>) item.get("auditorium");
        Map<String, Object> trainingType = (Map<String, Object>) item.get("trainingType");
        Map<String, Object> lessonPair = (Map<String, Object>) item.get("lessonPair");
        Map<String, Object> employee = (Map<String, Object>) item.get("employee");

        /* ================= SAVE SCHEDULE ================= */

        ScheduleList schedule = ScheduleList.builder()
                .hemisId(hemisId)
                .groups(group)
                .subject(subject)
                .semesterCode(semesterCode)
                .semesterName(semesterName)
                .auditoriumName(auditorium.get("name").toString())
                .auditoriumCode((Integer) auditorium.get("code"))
                .trainingTypeName(trainingType.get("name").toString())
                .trainingTypeCode(Integer.parseInt(trainingType.get("code").toString()))
                .lessonPairName(lessonPair.get("name").toString())
                .lessonPairCode(Integer.parseInt(lessonPair.get("code").toString()))
                .start_time(lessonPair.get("start_time").toString())
                .end_time(lessonPair.get("end_time").toString())
                .employeeId((Integer) employee.get("id"))
                .employeeName(employee.get("name").toString())
                .lessonDate(item.get("lesson_date").toString())
                .weekStartTime(item.get("weekStartTime").toString())
                .weekEndTime(item.get("weekEndTime").toString())
                .createdAt(LocalDateTime.now())
                .build();

        scheduleListRepo.save(schedule);

        /* ================= STUDENT LOGIC ================= */

        List<Student> students = new ArrayList<>();

        if (mainSuperGroup.isPresent()) {
            // 🔥 Main group → o‘zi + barcha subGroups

            students.addAll(studentRepo.findAllByGroupId(groupId));

            for (Groups sub : mainSuperGroup.get().getSubGroups()) {
                students.addAll(studentRepo.findAllByGroupId(sub.getId()));
            }

        } else {
            // Oddiy group
            students.addAll(studentRepo.findAllByGroupId(groupId));
        }

        Integer isChecked = 0;        // 0-not students, 1-not checked, 2-checked
        Integer isOnlineChecked = 0;  // 0-not students, 1-not checked, 2-checked

        for (Student student : students) {

            if (student.getSemester().equals(semesterCode)) {

                /* ================= WEEKDAY LOGIC ================= */

                // lesson_date unix timestamp (string) → LocalDate
                Long lessonDateUnix = Long.parseLong(item.get("lesson_date").toString());
                System.out.println(1);

                LocalDate lessonDate = LocalDateTime
                        .ofEpochSecond(lessonDateUnix, 0, ZoneId.of("UTC").getRules().getOffset(LocalDateTime.now()))
                        .toLocalDate();
                System.out.println(2);

                // Java DayOfWeek: MONDAY=1 ... SUNDAY=7
                int weekdayId = lessonDate.getDayOfWeek().getValue();
                System.out.println(3);

                // OnlineStudentWeekDay tekshiramiz
                Optional<OnlineStudentWeekDay> oswd =
                        onlineStudentWeekDayRepo.findByOnlineStudentStudentIdAndWeekdayId(
                                student.getId(),
                                weekdayId
                        );
                System.out.println(4);

                boolean todayOnline = false;

                if (Boolean.TRUE.equals(student.getIsOnline()) && oswd.isPresent() && Boolean.TRUE.equals(oswd.get().getActive())) {
                    todayOnline = true;
                }
                System.out.println(5);

                /* ================= SAVE ATTENDANCE ================= */

                AttendanceOffline attendanceOffline = AttendanceOffline.builder()
                        .student(student)
                        .isPresent(0)
                        .comment("")
                        .scheduleList(schedule)
                        .todayOnline(todayOnline)   // 🔥 MUHIM QATOR
                        .createdAt(LocalDateTime.now())
                        .build();
                System.out.println(6);

                attendanceOfflineRepo.save(attendanceOffline);
            }

            if (student.getIsOnline() == null) {
                isChecked = 1;
            } else if (student.getIsOnline()) {
                isOnlineChecked = 1;
            }
        }

        schedule.setIsChecked(isChecked);
        schedule.setIsOnlineChecked(isOnlineChecked);

        scheduleListRepo.save(schedule);

        return true;
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getScheduleListByGroupAndToday(
            @PathVariable UUID groupId
    ) {
        String todayTimestamp = todayTimestampGmt0();

        List<ScheduleList> schedules =
                scheduleListRepo.findByGroupsIdAndLessonDate(groupId, todayTimestamp);
//        List<ScheduleList> schedules =
//                scheduleListRepo.byGroupId(groupId);
        return ResponseEntity.ok(schedules);
    }


    @GetMapping("/sekretar/group")
    public ResponseEntity<?> getSekretarScheduleListByGroupAndToday() {
        String todayTimestamp = todayTimestampGmt0();
        List<ScheduleList> schedules = scheduleListRepo.findSekretarByLessonDate(todayTimestamp);
        return ResponseEntity.ok(schedules);
    }


    private String todayTimestampGmt0() {
        long startOfDayUtc = LocalDate.now(ZoneId.of("UTC"))
                .atStartOfDay(ZoneId.of("UTC"))
                .toEpochSecond();

        return String.valueOf(startOfDayUtc);
    }


    @PutMapping("/images")
    public ResponseEntity<?> uploadImage(
            @RequestBody SekretarImageDTO dto
    ) {

        if (dto.getScheduleListId() == null) {
            return ResponseEntity.badRequest().body("scheduleListId is required");
        }

        ScheduleList scheduleList = scheduleListRepo.findById(dto.getScheduleListId())
                .orElseThrow(() ->
                        new RuntimeException("ScheduleList not found"));

        // 1️⃣ Frontenddan kelgan attachment ID lar
        List<UUID> newIds = new ArrayList<>();

        if (dto.getImg1Id() != null) newIds.add(dto.getImg1Id());
        if (dto.getImg2Id() != null) newIds.add(dto.getImg2Id());
        if (dto.getImg3Id() != null) newIds.add(dto.getImg3Id());
        if (dto.getImg4Id() != null) newIds.add(dto.getImg4Id());
        if (dto.getImg5Id() != null) newIds.add(dto.getImg5Id());

        // 2️⃣ Attachment larni DB dan olib kelamiz
        List<Attachment> newAttachments = attachmentRepo.findAllById(newIds);

        // 3️⃣ 🔥 MUHIM QATOR — REPLACE
        scheduleList.setAttachment(newAttachments);

        // 4️⃣ Description
        if (dto.getSekretarDescription() != null) {
            scheduleList.setSekretarDescription(dto.getSekretarDescription());
        }

        scheduleList.setUploadedAttachmentTime(LocalDateTime.now());

        scheduleListRepo.save(scheduleList);

        return ResponseEntity.ok(scheduleList);
    }




}
