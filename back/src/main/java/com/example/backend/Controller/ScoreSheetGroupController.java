package com.example.backend.Controller;

import com.example.backend.DTO.ScoreSheetGroupDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Services.ExternalApiService;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/score-sheet-group")
@RequiredArgsConstructor
public class ScoreSheetGroupController {

    private final ScoreSheetGroupRepo scoreSheetGroupRepo;
    private final GroupsRepo groupsRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final UserRepo userRepo;
    private final StudentRepo studentRepo;
    private final ExternalApiService externalApiService;
    private final TokenHemisRepo tokenHemisRepo;
    private final ScoreSheetRepo scoreSheetRepo;
    private final AttachmentRepo attachmentRepo;
    private final RestTemplate restTemplate;
    private final String baseUrl = "https://student.buxpxti.uz/rest";

    private final MustaqilTalimStudentRepo mustaqilTalimStudentRepo;

    @PutMapping("/file-upload/{scoreSheetGroupId}/{attachmentId}")
    public ResponseEntity<?> uploadFile(@PathVariable UUID attachmentId, @PathVariable UUID scoreSheetGroupId) {
        Optional<ScoreSheetGroup> scoreGroup = scoreSheetGroupRepo.findById(scoreSheetGroupId);
        if (scoreGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Attachment> attachment = attachmentRepo.findById(attachmentId);
        if (attachment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ScoreSheetGroup scoreSheetGroup = scoreGroup.get();
        List<Attachment> attachments = scoreSheetGroup.getAttachments();
        attachments.add(attachment.get());
        scoreSheetGroup.setAttachments(attachments);
        ScoreSheetGroup save = scoreSheetGroupRepo.save(scoreSheetGroup);
        return ResponseEntity.ok(save);
    }
    @PutMapping("/change-time/{scoreSheetGroupId}")
    public ResponseEntity<ScoreSheetGroupDTO> changeTime(@PathVariable UUID scoreSheetGroupId,
                                                         @RequestBody ScoreSheetGroupDTO scoreSheetGroupDTO) {
        Optional<ScoreSheetGroup> scoreSheetGroupOpt = scoreSheetGroupRepo.findById(scoreSheetGroupId);
        if (scoreSheetGroupOpt.isPresent()) {
            ScoreSheetGroup scoreSheetGroup = scoreSheetGroupOpt.get();
            scoreSheetGroup.setStartTime(scoreSheetGroupDTO.getStartTime());
            scoreSheetGroup.setEndTime(scoreSheetGroupDTO.getEndTime());
            String qaytnoma = scoreSheetGroupDTO.getQaytnoma().toString()+"-qaytnoma";
            scoreSheetGroup.setQaytnoma(qaytnoma);
            scoreSheetGroupRepo.save(scoreSheetGroup);
            return new ResponseEntity<>(scoreSheetGroupDTO, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/change-status/{scoreSheetGroupId}")
    public ResponseEntity<ScoreSheetGroupDTO> changeStatus(@PathVariable UUID scoreSheetGroupId){
        Optional<ScoreSheetGroup> scoreSheetGroupOpt = scoreSheetGroupRepo.findById(scoreSheetGroupId);
        if (scoreSheetGroupOpt.isPresent()) {
            ScoreSheetGroup scoreSheetGroup = scoreSheetGroupOpt.get();
            if (scoreSheetGroup.getStatus()==null){
                scoreSheetGroup.setStatus(true);
            }else {
                scoreSheetGroup.setStatus(!scoreSheetGroup.getStatus());

            }
            scoreSheetGroupRepo.save(scoreSheetGroup);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    @PutMapping("/set-student/{studentId}/{scoreSheetGroupId}")
    public HttpEntity<?> setScoreSheet(@PathVariable UUID studentId, @PathVariable UUID scoreSheetGroupId){
        Optional<ScoreSheetGroup> scoreSheetGroupOpt = scoreSheetGroupRepo.findById(scoreSheetGroupId);
        Optional<Student> studentOpt = studentRepo.findById(studentId);
        if (scoreSheetGroupOpt.isPresent() && studentOpt.isPresent()){
            ScoreSheetGroup scoreSheetGroup = scoreSheetGroupOpt.get();
            Student student = studentOpt.get();
            ScoreSheet scoreSheet = new ScoreSheet(scoreSheetGroup, student, 0, 0, LocalDateTime.now(), scoreSheetGroup.getIsKursIshi());
            scoreSheetRepo.save(scoreSheet);
            return new ResponseEntity<>(scoreSheet, HttpStatus.OK);

        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/update/score-sheet")
    public HttpEntity<?> updateScoreSheet(){
        for (ScoreSheetGroup scoreSheetGroup : scoreSheetGroupRepo.findAll()) {
            List<ScoreSheet> byScoreSheetGroupId = scoreSheetRepo.findByScoreSheetGroupId(scoreSheetGroup.getId());
            for (ScoreSheet scoreSheet : byScoreSheetGroupId) {
                if(scoreSheet.getStudent().getGroup()==null){
                    scoreSheetRepo.delete(scoreSheet);
                }
            }

        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/add/update/score-sheet")
    public HttpEntity<?> addUpdateScoreSheet(){
        for (ScoreSheetGroup scoreSheetGroup : scoreSheetGroupRepo.findAll()) {
            Optional<Groups> byId = groupsRepo.findById(scoreSheetGroup.getGroup().getId());
            if (byId.isPresent()) {
                Groups groups = byId.get();
                List<Student> allByGroupId = studentRepo.findAllByGroup_Id(groups.getId());
                for (Student student : allByGroupId) {
                    Optional<ScoreSheet> byScoreSheetGroupIdAndStudentId = scoreSheetRepo.findByScoreSheetGroupIdAndStudentId(scoreSheetGroup.getId(), student.getId());
                    if (byScoreSheetGroupIdAndStudentId.isEmpty()) {
                        ScoreSheet scoreSheet = new ScoreSheet(scoreSheetGroup, student, 0, 0, LocalDateTime.now(), scoreSheetGroup.getIsKursIshi());
                        scoreSheetRepo.save(scoreSheet);

                    }

                }
            }
        }


        return new ResponseEntity<>(HttpStatus.OK);
    }


    // -----------------------------------------
    // 1) CREATE (Admin teacher-group-subject biriktiradi)
    // -----------------------------------------
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ScoreSheetGroupDTO dto) {

        // Fetch Group, CurriculumSubject, Teacher, and Lecturer
        Groups group = groupsRepo.findById(dto.getGroupId())
                .orElseThrow(() -> new RuntimeException("❌ Group not found"));

        CurriculumSubject curriculumSubject = curriculumSubjectRepo.findById(dto.getCurriculumSubjectId())
                .orElseThrow(() -> new RuntimeException("❌ Subject not found"));

        User teacher = userRepo.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("❌ Teacher not found"));

        User lecturer = userRepo.findById(dto.getLecturerId())
                .orElseThrow(() -> new RuntimeException("❌ Lecturer not found"));

        boolean kursIshi = dto.getIsKursIshi() != null && dto.getIsKursIshi();

        // Create ScoreSheetGroup
        ScoreSheetGroup sheet = ScoreSheetGroup.builder()
                .group(group)
                .curriculumSubject(curriculumSubject)
                .teacher(teacher)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .lecturer(lecturer)
                .isKursIshi(kursIshi)
                .qaytnoma("1-qaytnoma")
                .status(true)
                .build();

        scoreSheetGroupRepo.save(sheet);

        // Fetch students by groupId
        List<Student> allByGroupId = studentRepo.findAllByGroupId(group.getId());

        // Fetch token for external API requests
        List<TokenHemis> allTokens = tokenHemisRepo.findAll();
        if (allTokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }

        String token = allTokens.get(allTokens.size() - 1).getName();
        int page = 1;
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        for (Student student : allByGroupId) {
            // Fetch mustaqil_talim_student record based on studentId
            List<MustaqilTalimStudent> mustaqilTalimStudents = mustaqilTalimStudentRepo.findByStudentId(student.getId());

            Integer mustaqilBall = 0; // Default to 0 if no record found
            for (MustaqilTalimStudent mustaqilTalimStudent : mustaqilTalimStudents) {
                // Compare curriculumSubjectId with the curriculumSubjectId in MustaqilExam
                if (mustaqilTalimStudent.getMustaqilExam().getCurriculumSubject().getId().equals(dto.getCurriculumSubjectId())) {
                    mustaqilBall = mustaqilTalimStudent.getBall(); // Get the ball value from the matching record
                    break; // Stop once we find a match
                }
            }

            // Making an external API request to fetch student subject list
            ResponseEntity<?> response = externalApiService.sendRequest(
                    "v1/data/student-subject-list?_student=" + student.getHemisId(),
                    HttpMethod.GET,
                    headers,
                    Map.of("page", page),
                    null
            );

            // Process API response
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");


            // If the student is "my" or has valid subject items, create the ScoreSheet
            if (Boolean.TRUE.equals(student.getIsMy()) || !items.isEmpty()) {
                ScoreSheet scoreSheet = new ScoreSheet(sheet, student, mustaqilBall, 0, LocalDateTime.now(), kursIshi);


                // 🔥 3 MARTALIK RETRY VA 500ms KUTISH BILAN NB OLIB KELADI
                List<Integer> nb = getAttendanceStudentString(sheet.getCurriculumSubject() .getSubject().getHemisId(), student.getHemisId(), student.getSemester());
                scoreSheet.setTotalNb(nb.get(0));
                scoreSheet.setSababliNB(nb.get(1));
                scoreSheet.setSababsizNb(nb.get(2));

                scoreSheetRepo.save(scoreSheet);
            }
        }

        return ResponseEntity.ok(sheet);
    }

    private List<Integer> getAttendanceStudentString(Integer subjectId, Integer hemisId, String semester) {

        String url = baseUrl + "/v1/data/attendance-list?_subject=" + subjectId + "&_student=" + hemisId+"&_semester="+semester;

        HttpHeaders headers = new HttpHeaders();
        List<TokenHemis> tokens = tokenHemisRepo.findAll();

        String token = tokens.get(tokens.size() - 1).getName();
        headers.setBearerAuth(token);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && (Boolean) body.get("success")) {

                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                int totalNB = 0;
                int sababliNB = 0;
                int sababsizNB = 0;

                for (Map<String, Object> item : items) {
                    int absentOn = (int) item.get("absent_on");
                    int absentOff = (int) item.get("absent_off");

                    totalNB += absentOff;

                    if (absentOn > 0) {
                        sababliNB += absentOff;
                    } else {
                        sababsizNB += absentOff;
                    }
                }

                return Arrays.asList(totalNB, sababliNB, sababsizNB);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return Arrays.asList(0, 0, 0);
    }

    // -----------------------------------------
    // 2) GET ALL
    // -----------------------------------------
    @GetMapping
    public ResponseEntity<?> getAll() {
        List<ScoreSheetGroup> list = scoreSheetGroupRepo.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getAllSemestr(
            @RequestParam String semesterCode,
            @RequestParam UUID groupId
    ) {

        List<ScoreSheetGroup> list =
                scoreSheetGroupRepo.findAllFilter(semesterCode, groupId);

        return ResponseEntity.ok(list);
    }

    // -----------------------------------------
    // 3) GET ONE BY ID
    // -----------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable UUID id) {
        ScoreSheetGroup sheet = scoreSheetGroupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Not found"));
        return ResponseEntity.ok(sheet);
    }

    // -----------------------------------------
    // 4) UPDATE
    // -----------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ScoreSheetGroupDTO dto) {
        System.out.println(dto);
        ScoreSheetGroup sheet = scoreSheetGroupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Not found"));


        if (dto.getGroupId() != null) {
            sheet.setGroup(groupsRepo.findById(dto.getGroupId())
                    .orElseThrow(() -> new RuntimeException("❌ Group not found")));
        }

        if (dto.getCurriculumSubjectId() != null) {
            sheet.setCurriculumSubject(curriculumSubjectRepo.findById(dto.getCurriculumSubjectId())
                    .orElseThrow(() -> new RuntimeException("❌ Subject not found")));
        }

        if (dto.getTeacherId() != null) {
            sheet.setTeacher(userRepo.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("❌ Teacher not found")));
        }

        if (dto.getLecturerId() != null) {
            sheet.setLecturer(userRepo.findById(dto.getLecturerId())
                    .orElseThrow(() -> new RuntimeException("❌ Teacher not found")));
        }
        if(dto.getIsKursIshi()!=sheet.getIsKursIshi()){
            List<ScoreSheet> byScoreSheetGroupId = scoreSheetRepo.findByScoreSheetGroupId(sheet.getId());
            for (ScoreSheet scoreSheet : byScoreSheetGroupId) {
                scoreSheet.setKursIshiStatus(dto.getIsKursIshi());
                scoreSheetRepo.save(scoreSheet);
            }

        }
        sheet.setIsKursIshi(dto.getIsKursIshi());


        String qaytnoma = dto.getQaytnoma().toString()+"-qaytnoma";
        sheet.setQaytnoma(qaytnoma);
        sheet.setStartTime(dto.getStartTime());
        sheet.setEndTime(dto.getEndTime());

        sheet.setDescription(dto.getDescription());

        scoreSheetGroupRepo.save(sheet);
        return ResponseEntity.ok(sheet);
    }

    // -----------------------------------------
    // 5) DELETE
    // -----------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        scoreSheetRepo.deleteByScoreSheetGroupId(id);
        scoreSheetGroupRepo.deleteById(id);
        return ResponseEntity.ok("✔️ Deleted successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getTeacher(@PathVariable UUID teacherId) {
        List<ScoreSheetGroup> list = scoreSheetGroupRepo.findByTeacherId(teacherId);
        return ResponseEntity.ok(list);
    }

//    @GetMapping("/lecturer/{teacherId}")
//    public ResponseEntity<?> getLecturerTeacher(@PathVariable UUID teacherId) {
//
//    }


    @GetMapping("/students-group/{groupId}")
    public ResponseEntity<?> getStudentsGroup(@PathVariable UUID groupId) {
        List<Student> allByGroupId = studentRepo.findAllByGroupId(groupId);
        return ResponseEntity.ok(allByGroupId);
    }
}
