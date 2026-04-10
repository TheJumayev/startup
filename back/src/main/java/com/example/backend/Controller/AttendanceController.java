package com.example.backend.Controller;

import com.example.backend.DTO.AttendanceDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.*;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/attendance")
public class AttendanceController {
    private final AttendanceRepo attendanceRepo;
    private final GroupsRepo groupsRepo;
    private final OnlineStudentWeekDayRepo onlineStudentWeekDayRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final StudentRepo studentRepo;
    private final OnlineStudentRepo onlineStudentRepo;
    private final ExternalApiService externalApiService;
//e6cc7bbb-5b0d-46ef-9122-e80315486fa6
    @GetMapping("/excel/{groupId}")
    public ResponseEntity<byte[]> exportExcel(@PathVariable UUID groupId) {
        System.out.println("GROUP: " + groupId);
        List<Student> students = studentRepo.findAllByGroupIdAndIsOnline(groupId);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance");
            // -------------------------
            // HEADER
            // -------------------------
            Row header = sheet.createRow(0);

            header.createCell(0).setCellValue("TR");
            header.createCell(1).setCellValue("Guruh");
            header.createCell(2).setCellValue("Talaba");
            header.createCell(3).setCellValue("Fan");
            header.createCell(4).setCellValue("Ta'lim turi");
            header.createCell(5).setCellValue("Juftlik");
            header.createCell(6).setCellValue("Sana");
            header.createCell(7).setCellValue("Davomat");

            int rowIndex = 1;
            int counter = 1;

            // -------------------------
            // FILL ROWS
            // -------------------------
            for (Student student : students) {

                List<Attendance> attendanceList = attendanceRepo.findByStudentId(student.getId());

                for (Attendance a : attendanceList) {

                    // ✅ Convert lessonDate (string OR epoch seconds) to LocalDate
                    LocalDate dateValue = null;

                    try {
                        String ld = a.getLessonDate();

                        if (ld == null) {
                            dateValue = null;
                        } else if (ld.matches("\\d+")) {
                            // Epoch seconds
                            long epoch = Long.parseLong(ld);
                            dateValue = Instant.ofEpochSecond(epoch)
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                        } else {
                            // Standard ISO date
                            dateValue = LocalDate.parse(ld);
                        }

                    } catch (Exception ignored) {}

                    // -------------------------
                    // Create row
                    // -------------------------
                    Row row = sheet.createRow(rowIndex++);

                    row.createCell(0).setCellValue(counter++);
                    row.createCell(1).setCellValue(student.getGroupName());
                    row.createCell(2).setCellValue(student.getFullName());
                    row.createCell(3).setCellValue(a.getSubjectName());
                    row.createCell(4).setCellValue(a.getTrainingTypeName());
                    row.createCell(5).setCellValue(a.getLessonPairName());

                    row.createCell(6).setCellValue(
                            dateValue != null ? dateValue.toString() : ""
                    );

                    // -------------------------
                    // DAVOMAT COLUMN FIXED
                    // -------------------------
                    String davomat;
                    if (a.getPresent() == null) {
                        davomat = "Belgilanmagan";
                    } else if (a.getPresent()) {
                        davomat = "+";
                    } else {
                        davomat = "-";
                    }

                    row.createCell(7).setCellValue(davomat);
                }
            }

            // Auto-size columns
            for (int i = 0; i < 8; i++) {
                sheet.autoSizeColumn(i);
            }

            // -------------------------
            // RETURN FILE
            // -------------------------
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            byte[] fileBytes = out.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDispositionFormData("attachment", "attendance.xlsx");
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }





    @PutMapping("/{onlineId}")
    public HttpEntity<?> editAttendace(@PathVariable UUID onlineId){
        Optional<Attendance> onlineStudent = attendanceRepo.findById(onlineId);
        if (onlineStudent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Attendance attendance = onlineStudent.get();
        if(onlineStudent.get().getPresent()){
            attendance.setPresent(null);
        }else{
            attendance.setPresent(true);
        }
        Attendance save = attendanceRepo.save(attendance);
        return ResponseEntity.ok(save);
    }


    // --- CREATE (Save attendance) ---
    @PostMapping
    public HttpEntity<?> saveAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        System.out.println("attendanceDTO = " + attendanceDTO);
        Optional<Attendance> attendance = attendanceRepo.findById(attendanceDTO.getId());
        if (attendance.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Attendance attendanceEntity = attendance.get();
        attendanceEntity.setPresent(attendanceDTO.getPresent());
        attendanceEntity.setComment(attendanceDTO.getComment());
        attendanceEntity.setUpdateTime(LocalDateTime.now());
        Attendance save = attendanceRepo.save(attendanceEntity);

        return new ResponseEntity<>(save, HttpStatus.CREATED);
    }

    // --- GET ALL ---
    @GetMapping
    public HttpEntity<?> getAll() {
        return new ResponseEntity<>(attendanceRepo.findAll(), HttpStatus.OK);
    }

    // --- GET by Student (through OnlineStudentWeekDay) --- davomat
    @GetMapping("/student/{studentId}")
    public HttpEntity<?> getByStudent(@PathVariable UUID studentId) {
        List<Attendance> attendances = attendanceRepo.findByOnlineStudentWeekDay_OnlineStudent_Student_Id(studentId);
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }

    // --- GET by Date ---
    @GetMapping("/date/{date}")
    public HttpEntity<?> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return new ResponseEntity<>(attendanceRepo.findByDate(date), HttpStatus.OK);
    }

    // --- GET by Week (ISO week number) ---
    @GetMapping("/week/{year}/{week}")
    public HttpEntity<?> getByWeek(@PathVariable int year, @PathVariable int week) {
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        LocalDate startOfWeek = LocalDate.now()
                .withYear(year)
                .with(weekFields.weekOfWeekBasedYear(), week)
                .with(weekFields.dayOfWeek(), 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        List<Attendance> attendances = attendanceRepo.findByDateBetween(startOfWeek, endOfWeek);
        return new ResponseEntity<>(attendances, HttpStatus.OK);
    }

    // --- GET by Weekday (e.g., MONDAY) ---
    // --- GET by Weekday (current week only) ---
    @GetMapping("/weekday/{timestamp}")
    public HttpEntity<?> getByDay(@PathVariable Long timestamp) {
        // Convert timestamp (seconds) → LocalDate in UTC+5 (Uzbekistan)
        Instant instant = Instant.ofEpochSecond(timestamp);
        ZoneId zone = ZoneId.of("Asia/Tashkent");
        LocalDate date = instant.atZone(zone).toLocalDate();

        // Start of day (00:00:00)
        long startTs = date.atStartOfDay(zone).toEpochSecond();
        // End of day (23:59:59)
        long endTs = date.plusDays(1).atStartOfDay(zone).toEpochSecond() - 1;

        System.out.println("startTs = " + startTs);
        System.out.println("endTs = " + endTs);

        List<Attendance> result = attendanceRepo.findAllByWeekdayAndLessonDateBetween(startTs, endTs);

        return ResponseEntity.ok(result);
    }

    // --- STATISTICS: Student summary --- davomat
    @GetMapping("/statistics/student/{studentId}")
    public HttpEntity<?> getStudentStatistics(@PathVariable UUID studentId) {
        List<Attendance> attendances =
                attendanceRepo.findByOnlineStudentWeekDay_OnlineStudent_Student_Id(studentId);

        long total = attendances.size();

        // учитываем только true/false, null пропускаем
        long present = attendances.stream()
                .filter(a -> Boolean.TRUE.equals(a.getPresent()))
                .count();

        long absent = attendances.stream()
                .filter(a -> Boolean.FALSE.equals(a.getPresent()))
                .count();

        long undefined = attendances.stream()
                .filter(a -> a.getPresent() == null)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("studentId", studentId);
        stats.put("total", total);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("undefined", undefined); // 👈 добавил отдельно «не отмечено»
        stats.put("attendanceRate", total > 0 ? (present * 100.0 / total) : 0);

        return new ResponseEntity<>(stats, HttpStatus.OK);
    }


    // --- STATISTICS: by Date ---
    @GetMapping("/statistics/date/{date}")
    public HttpEntity<?> getDateStatistics(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendances = attendanceRepo.findByDate(date);
        long present = attendances.stream().filter(Attendance::getPresent).count();
        long absent = attendances.size() - present;

        Map<String, Object> stats = new HashMap<>();
        stats.put("date", date);
        stats.put("present", present);
        stats.put("absent", absent);

        return new ResponseEntity<>(stats, HttpStatus.OK);
    }


    @GetMapping("/get-week-lessons")
    public ResponseEntity<?> getWeekLessons() {
        ZoneId tz = ZoneId.of("Asia/Tashkent");
        LocalDate today = LocalDate.now(tz);

        LocalDate startOfIsoWeek = today.with(WeekFields.ISO.dayOfWeek(), -10); // Monday
        System.out.println("startOfIsoWeek = " + startOfIsoWeek);
        LocalDate endOfIsoWeek = startOfIsoWeek.plusDays(7).minusDays(0);   // next Monday (exclusive) helper below uses <= endTs

        long fromEpoch = startOfIsoWeek.atStartOfDay(tz).toEpochSecond();
        long toEpoch = endOfIsoWeek.plusDays(1).atStartOfDay(tz).toEpochSecond() - 1; // Sunday 23:59:59

        return getLessonsForRange(null, fromEpoch, toEpoch, tz);
    }

    @GetMapping("/get-week-lessons/group/{hemisGroupId}")
    public ResponseEntity<?> getWeekLessonsForGroup(@PathVariable Integer hemisGroupId) {
        ZoneId tz = ZoneId.of("Asia/Tashkent");
        LocalDate today = LocalDate.now(tz);

        LocalDate startOfIsoWeek = today.with(WeekFields.ISO.dayOfWeek(), 1); // Monday
        LocalDate endOfIsoWeek = startOfIsoWeek.plusDays(7).minusDays(0);

        long fromEpoch = startOfIsoWeek.atStartOfDay(tz).toEpochSecond();
        long toEpoch = endOfIsoWeek.plusDays(1).atStartOfDay(tz).toEpochSecond() - 1;

        return getLessonsForRange(hemisGroupId, fromEpoch, toEpoch, tz);
    }

    // keep your "today" endpoints, but delegate to range worker for 00:00..23:59 today
    @GetMapping("/get-today-lessons")
    public ResponseEntity<?> getTodayLessons() {
        ZoneId tz = ZoneId.of("Asia/Tashkent");
        LocalDate today = LocalDate.now(tz);

        long fromEpoch = today.atStartOfDay(tz).toEpochSecond();
        long toEpoch = today.plusDays(1).atStartOfDay(tz).toEpochSecond() - 1;

        return getLessonsForRange(null, fromEpoch, toEpoch, tz);
    }

    @GetMapping("/get-today-lessons/group/{hemisGroupId}")
    public ResponseEntity<?> getTodayLessonsForGroup(@PathVariable Integer hemisGroupId) {
        ZoneId tz = ZoneId.of("Asia/Tashkent");
        LocalDate today = LocalDate.now(tz);

        long fromEpoch = today.atStartOfDay(tz).toEpochSecond();
        long toEpoch = today.plusDays(1).atStartOfDay(tz).toEpochSecond() - 1;

        return getLessonsForRange(hemisGroupId, fromEpoch, toEpoch, tz);
    }

    /* ===================== shared range worker ===================== */

    private ResponseEntity<?> getLessonsForRange(Integer onlyThisHemisGroupId,
                                                 long fromEpoch,
                                                 long toEpoch,
                                                 ZoneId tz) {
        int savedCount = 0;

        // 1) Token
        List<TokenHemis> tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found in DB");
        }
        String token = tokens.get(tokens.size() - 1).getName();

        // 2) All active OSWDs (do NOT filter by today’s weekday — we want the whole week)
        List<OnlineStudentWeekDay> oswds = onlineStudentWeekDayRepo.findAllByActiveTrue();
        if (oswds.isEmpty()) {
            return ResponseEntity.ok("ℹ️ No active OnlineStudentWeekDay rows.");
        }

        // 3) Distinct HEMIS group ids among those OSWDs
        Set<Integer> hemisGroupIds = oswds.stream()
                .map(o -> {
                    try {
                        return o.getOnlineStudent().getStudent().getGroup().getHemisId();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (hemisGroupIds.isEmpty()) {
            return ResponseEntity.ok("ℹ️ No HEMIS group ids found among active OSWDs.");
        }
        if (onlyThisHemisGroupId != null) {
            hemisGroupIds = hemisGroupIds.stream()
                    .filter(g -> g.equals(onlyThisHemisGroupId))
                    .collect(Collectors.toSet());
            if (hemisGroupIds.isEmpty()) {
                return ResponseEntity.ok("ℹ️ The provided group has no active OSWDs.");
            }
        }

        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        for (Integer hemisGroupId : hemisGroupIds) {
            int page = 1;
            int pageCount = 1; // will be updated from API

            final int gId = hemisGroupId;
            List<OnlineStudentWeekDay> oswdsForGroup = oswds.stream()
                    .filter(os -> {
                        try {
                            return Objects.equals(os.getOnlineStudent().getStudent().getGroup().getHemisId(), gId);
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .toList();

            while (page <= pageCount) {
                Map<String, Object> query = new HashMap<>();
                query.put("page", page);
                query.put("limit", 200);                 // optional: fetch more per page
                query.put("l", "uz-UZ");
                query.put("_group", hemisGroupId);
                query.put("lesson_date_from", 1757356800);
//                query.put("lesson_date_from", fromEpoch);
                query.put("lesson_date_to", toEpoch);

                ResponseEntity<?> resp = externalApiService.sendRequest(
                        "v1/data/schedule-list",
                        HttpMethod.GET,
                        headers,
                        query,
                        null
                );

                // Token errors
                if (resp.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("❌ HEMIS token invalid or expired. Please refresh the token.");
                }
                if (!resp.getStatusCode().is2xxSuccessful() || !(resp.getBody() instanceof Map)) {
                    return ResponseEntity.status(resp.getStatusCode())
                            .body("❌ Failed for group " + hemisGroupId + " page " + page + ": " + resp.getBody());
                }

                Map body = (Map) resp.getBody();
                Object dataObj = body.get("data");
                if (!(dataObj instanceof Map)) break;
                Map data = (Map) dataObj;

                pageCount = readPageCount(data, 1);

                Object itemsObj = data.get("items");
                if (itemsObj instanceof List<?> items) {
                    for (Object raw : items) {
                        if (!(raw instanceof Map)) continue;
                        Map item = (Map) raw;

                        Long lessonEpoch = asLong(item.get("lesson_date"));
                        if (lessonEpoch == null) continue;

                        // We already filtered in the API query by from/to; no need to re-check day==today.
                        LocalDateTime lessonDate = LocalDateTime.ofEpochSecond(
                                lessonEpoch, 0, ZoneOffset.ofTotalSeconds(tz.getRules().getOffset(Instant.ofEpochSecond(lessonEpoch)).getTotalSeconds())
                        );

                        Integer hemisId = asInt(item.get("id")); // schedule item id -> for your unique (oswd, hemisId)
                        Integer subjectId = asInt(path(item, "subject", "id"));
                        String subjectName = asString(path(item, "subject", "name"));
                        String subjectCode = asString(path(item, "subject", "code"));

                        Integer semesterId = asInt(path(item, "semester", "id"));
                        String semesterName = asString(path(item, "semester", "name"));

                        String trainingTypeName = asString(path(item, "trainingType", "name"));
                        String lessonPairName = asString(path(item, "lessonPair", "name"));
                        String startTime = asString(path(item, "lessonPair", "start_time"));
                        String endTime = asString(path(item, "lessonPair", "end_time"));

                        Integer employeeId = asInt(path(item, "employee", "id"));
                        String employeeName = asString(path(item, "employee", "name"));
                        String lessonDateStr = String.valueOf(lessonEpoch);

                        // Uzbek -> English weekday mapping
                        Map<String, String> uzToEnWeekday = Map.ofEntries(
                                Map.entry("DUSHANBA", "MONDAY"),
                                Map.entry("SESHANBA", "TUESDAY"),
                                Map.entry("CHORSHANBA", "WEDNESDAY"),
                                Map.entry("PAYSHANBA", "THURSDAY"),
                                Map.entry("JUMA", "FRIDAY"),
                                Map.entry("SHANBA", "SATURDAY"),
                                Map.entry("YAKSHANBA", "SUNDAY")
                        );

                        for (OnlineStudentWeekDay oswd : oswdsForGroup) {
                            if (oswd.getWeekday() == null || oswd.getWeekday().getDay() == null)
                                continue;

                            // Normalize names
                            String uzDay = oswd.getWeekday().getDay().toUpperCase(Locale.ROOT).trim();
                            String lessonDay = lessonDate.getDayOfWeek().name(); // English MONDAY..SUNDAY

                            // Convert Uzbek -> English for comparison
                            String convertedUzDay = uzToEnWeekday.getOrDefault(uzDay, uzDay);

                            System.out.println("Lesson day: " + lessonDay + " | OSWD day: " + convertedUzDay);

                            // Skip if not same weekday
                            if (!lessonDay.equals(convertedUzDay)) {
                                continue;
                            }

                            Optional<Attendance> checkATD =
                                    attendanceRepo.findByHemisIdAndOnlineStudentWeekdayId(hemisId, oswd.getId());
                            if (checkATD.isPresent()) {
                                System.out.println("bor");
                                continue;
                            }

                            Attendance att = Attendance.builder()
                                    .hemisId(hemisId)
                                    .onlineStudentWeekDay(oswd)
                                    .subjectId(subjectId)
                                    .subjectName(subjectName)
                                    .subjectCode(subjectCode)
                                    .semesterId(semesterId)
                                    .semesterName(semesterName)
                                    .trainingTypeName(trainingTypeName)
                                    .lessonPairName(lessonPairName)
                                    .start_time(startTime)
                                    .end_time(endTime)
                                    .employeeId(employeeId)
                                    .employeeName(employeeName)
                                    .date(lessonDate)
                                    .lessonDate(String.valueOf(lessonEpoch))
                                    .present(null)
                                    .comment(null)
                                    .build();

                            try {
                                attendanceRepo.save(att);
                                savedCount++;
                            } catch (Exception e) {
                                System.err.println("⚠️ Duplicate skipped for hemisId=" + hemisId +
                                        " oswd=" + oswd.getId() + " (" + convertedUzDay + ")");
                            }
                        }

                    }
                }
                page++;
            }
        }

        return ResponseEntity.ok("✅ Sync complete for range [" + fromEpoch + " .. " + toEpoch + "]. New saved: " + savedCount);
    }

    /* ---------- helpers (same as yours) ---------- */

    private static int readPageCount(Map data, int def) {
        Object pagObj = data.get("pagination");
        if (pagObj instanceof Map pag) {
            Object pc = pag.get("pageCount");
            if (pc instanceof Number) return ((Number) pc).intValue();
            try {
                return Integer.parseInt(String.valueOf(pc));
            } catch (Exception ignored) {
            }
        }
        return def;
    }

    private static Object path(Map map, String... keys) {
        Object cur = map;
        for (String k : keys) {
            if (!(cur instanceof Map)) return null;
            cur = ((Map) cur).get(k);
            if (cur == null) return null;
        }
        return cur;
    }

    private static String asString(Object o) {
        return (o == null) ? null : String.valueOf(o);
    }

    private static Integer asInt(Object o) {
        if (o instanceof Number) return ((Number) o).intValue();
        try {
            return (o == null) ? null : Integer.parseInt(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }

    private static Long asLong(Object o) {
        if (o instanceof Number) return ((Number) o).longValue();
        try {
            return (o == null) ? null : Long.parseLong(String.valueOf(o));
        } catch (Exception e) {
            return null;
        }
    }


}
