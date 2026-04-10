package com.example.backend.Controller;

import com.example.backend.DTO.TeacherHomeworkDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/teacher-homework")
public class TeacherHomeworkController {
    private final TeacherCurriculumSubjectRepo teacherCurriculumSubjectRepo;
    private final HomeworkRepo homeworkRepo;
    private final ResponseHomeworkRepo responseHomeworkRepo;
    private final LessonRepo lessonRepo;
    private final AttachmentRepo attachmentRepo;
    private final StudentRepo studentRepo;
    private final TestHomeworkRepo testHomeworkRepo; // 🔹 Shu joyni qo‘shish kerak

    /* -------------------- Attachments -------------------- */

    @PostMapping("/attachments/upload")
    public HttpEntity<?> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "/homework") String prefix
    ) {
        try {
            Attachment attachment = Attachment.createAttachment(file, prefix);
            if (attachment == null) {
                return ResponseEntity.badRequest().body("❌ File is empty.");
            }
            attachmentRepo.save(attachment);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Upload error: " + e.getMessage());
        }
    }

    @GetMapping("/attachments/{id}")
    public HttpEntity<?> getAttachment(@PathVariable UUID id) {
        return attachmentRepo.findById(id)
                .<HttpEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Attachment not found"));
    }

    /* -------------------- Homework CRUD -------------------- */

    @PostMapping
    public HttpEntity<?> createHomework(@RequestBody TeacherHomeworkDTO dto) {
        try {
            // 🔹 1. Lessonni tekshirish
            Optional<Lesson> optLesson = lessonRepo.findById(dto.getLessonId());
            if (optLesson.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Lesson not found.");
            }

            // 🔹 2. Attachmentni olish (agar mavjud bo‘lsa)
            Attachment attachment = null;
            if (dto.getAttachmentId() != null) {
                attachment = attachmentRepo.findById(dto.getAttachmentId())
                        .orElseThrow(() -> new RuntimeException("Attachment not found."));
            }

            Lesson lesson = optLesson.get();
            lesson.setIsPresent(true);
            lessonRepo.save(lesson);

            // 🔹 3. Homework obyektini yaratish
            Homework homework = new Homework();
            homework.setLesson(lesson);
            homework.setAttachment(attachment);
            homework.setVideoUrl(dto.getVideoUrl());
            homework.setDescription(dto.getDescription());
            homework.setStatus(true);
            homework.setCreated(LocalDateTime.now());
            homework.setHaveTest(dto.isHaveTest());
            List<TestHomework> batch = new ArrayList<>();

            // 🔹 4. Agar test bo‘lsa, uni parse qilib saqlash
            if (dto.isHaveTest() && dto.getTest() != null && !dto.getTest().trim().isEmpty()) {
                String rawInput = dto.getTest();
                String test = rawInput;

                try {
                    ObjectMapper om = new ObjectMapper();
                    for (int round = 0; round < 2; round++) {
                        int firstBrace = test.indexOf('{');
                        int lastBrace = test.lastIndexOf('}');
                        if (firstBrace >= 0 && lastBrace > firstBrace) {
                            String maybeJson = test.substring(firstBrace, lastBrace + 1).trim();
                            if (maybeJson.contains("\"test\"")) {
                                JsonNode root = om.readTree(maybeJson);
                                JsonNode tNode = root.get("test");
                                if (tNode != null && !tNode.isNull()) {
                                    test = tNode.asText();
                                    continue;
                                }
                            }
                        }
                        break;
                    }
                } catch (Exception ignore) {}

                String normalized = test.replace("\r\n", "\n").trim();
                if (!normalized.isEmpty()) {
                    String[] blocks = normalized.split("(?m)^\\s*\\+{5,}\\s*$");

                    for (String rawBlock : blocks) {
                        String block = rawBlock.trim();
                        if (block.isEmpty()) continue;

                        String[] parts = block.split("(?m)^\\s*=+\\s*$");
                        List<String> cleaned = new ArrayList<>();
                        for (String p : parts) {
                            String t = p.trim();
                            if (!t.isEmpty()) cleaned.add(t);
                        }

                        if (cleaned.size() < 5) continue;

                        String question = cleaned.get(0);
                        List<String> options = new ArrayList<>();
                        String correct = null;

                        for (int i = 1; i < cleaned.size(); i++) {
                            String opt = cleaned.get(i).trim();
                            if (opt.isEmpty()) continue;

                            if (opt.startsWith("#")) {
                                String dropHash = opt.substring(1).trim();
                                if (!dropHash.isEmpty()) correct = dropHash;
                            } else {
                                options.add(opt);
                            }
                        }

                        if (correct != null) options.add(0, correct);
                        while (options.size() < 4) options.add("");
                        if (options.size() > 4) options = options.subList(0, 4);

                        if (question.isEmpty() || options.get(0).isEmpty()) continue;

                        TestHomework row = TestHomework.builder()
                                .question(question)
                                .answer1(options.get(0))
                                .answer2(options.get(1))
                                .answer3(options.get(2))
                                .answer4(options.get(3))
                                .ball(dto.getBall())
                                .created(LocalDateTime.now())
                                .build();

                        batch.add(row);
                    }

                    if (!batch.isEmpty()) {
                        List<TestHomework> savedTests = testHomeworkRepo.saveAll(batch);
                        homework.setTestHomework(batch); // 🔹 Testlarni Homeworkga bog‘lash
                        System.out.println("✅ Saved " + batch.size() + " test questions.");
                    }
                }
            }

            // 🔹 5. Homeworkni saqlash
            homeworkRepo.save(homework);
            return ResponseEntity.status(HttpStatus.CREATED).body(homework);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Create error: " + e.getMessage());
        }
    }


    // Get all homeworks (paginated)
    @GetMapping
    public HttpEntity<?> getAllHomework(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Homework> p = homeworkRepo.findAll(PageRequest.of(page, size));
            Map<String, Object> payload = Map.of(
                    "content", p.getContent(),
                    "page", p.getNumber(),
                    "size", p.getSize(),
                    "totalElements", p.getTotalElements(),
                    "totalPages", p.getTotalPages()
            );
            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Fetch error: " + e.getMessage());
        }
    }

    // Get homeworks by CurriculumSubject ID
    @GetMapping("/{curriculumSubjectId}")
    public HttpEntity<?> getHomeworkByCurriculumSubject(@PathVariable UUID curriculumSubjectId) {
        try {
            List<Homework> list = homeworkRepo.findByLesson_CurriculumSubject_IdOrderByCreatedDesc(curriculumSubjectId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Fetch error: " + e.getMessage());
        }
    }

    // Get one homework
    @GetMapping("/one/{id}")
    public HttpEntity<?> getOneHomework(@PathVariable UUID id) {
        return homeworkRepo.findById(id)
                .<HttpEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Homework not found"));
    }

    @GetMapping("/by-lesson/{lessonId}")
    public HttpEntity<?> getHomeworkByLesson(@PathVariable UUID lessonId) {
        List<Homework> all = homeworkRepo.findAllByLessonId(lessonId);
        return ResponseEntity.ok(all);
    }

    @GetMapping("/statistic-teacher")
    public HttpEntity<?> getStatisticTeacher() {
        List<TeacherCurriculumSubject> all = teacherCurriculumSubjectRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (TeacherCurriculumSubject tcs : all) {
            if (tcs.getTeacher() == null || tcs.getGroups() == null || tcs.getCurriculumSubject() == null)
                continue;

            UUID teacherId = tcs.getTeacher().getId();
            String teacherName = tcs.getTeacher().getName();
            UUID groupId = tcs.getGroups().getId();
            String groupName = tcs.getGroups().getName();

            for (CurriculumSubject curriculum : tcs.getCurriculumSubject()) {
                String subjectName = curriculum.getSubject() != null
                        ? curriculum.getSubject().getName()
                        : "Noma’lum fan";

                int totalHomework = 0;
                int videoCount = 0;
                int pdfCount = 0;
                int testCount = 0;
                int commentCount = 0;

                int totalStudents = studentRepo.countByGroupId(groupId);
                Set<UUID> submittedStudents = new HashSet<>();
                Set<UUID> gradedStudents = new HashSet<>();

                List<Lesson> lessons = lessonRepo.findAllByCurriculumSubjectIdOrderByPositionAsc(curriculum.getId());
                for (Lesson lesson : lessons) {
                    List<Homework> homeworks = homeworkRepo.findAllByLessonId(lesson.getId());
                    totalHomework += homeworks.size();

                    for (Homework hw : homeworks) {
                        if (hw.getVideoUrl() != null && !hw.getVideoUrl().isBlank()) videoCount++;
                        if (hw.getAttachment() != null) pdfCount++;
                        if ((hw.getHaveTest() != null && hw.getHaveTest())
                                || (hw.getTestHomework() != null && !hw.getTestHomework().isEmpty())) testCount++;
                        if (hw.getDescription() != null && !hw.getDescription().isBlank()) commentCount++;

                        List<ResponseHomework> responses = responseHomeworkRepo.findAllByHomeworkId(hw.getId());
                        for (ResponseHomework r : responses) {
                            if (r.getStudent() != null && r.getStudent().getGroup() != null
                                    && r.getStudent().getGroup().getId().equals(groupId)) {
                                if (Boolean.TRUE.equals(r.getIsSend()))
                                    submittedStudents.add(r.getStudent().getId());
                                if (Boolean.TRUE.equals(r.getGradedStatus()))
                                    gradedStudents.add(r.getStudent().getId());
                            }
                        }
                    }
                }

                int totalSubmitted = submittedStudents.size();
                int totalGraded = gradedStudents.size();
                int notSubmittedCount = Math.max(0, totalStudents - totalSubmitted);

                Map<String, Object> stat = new LinkedHashMap<>();
                stat.put("teacherName", teacherName);
                stat.put("groupName", groupName);
                stat.put("subjectName", subjectName);
                stat.put("totalStudents", totalStudents);
                stat.put("submittedCount", totalSubmitted);
                stat.put("gradedCount", totalGraded);
                stat.put("notSubmittedCount", notSubmittedCount);
                stat.put("totalHomework", totalHomework);
                stat.put("videoCount", videoCount);
                stat.put("pdfCount", pdfCount);
                stat.put("testCount", testCount);
                stat.put("commentCount", commentCount);

                result.add(stat);
            }
        }

        return ResponseEntity.ok(result);
    }


    @PutMapping("/{id}")
    public HttpEntity<?> updateHomework(@PathVariable UUID id, @RequestBody TeacherHomeworkDTO dto) {
        try {
            Optional<Homework> optionalHomework = homeworkRepo.findById(id);
            if (optionalHomework.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Homework not found.");
            }

            Homework hw = optionalHomework.get();

            // 🔹 1. Video URL, description, va status yangilash
            if (dto.getVideoUrl() != null) hw.setVideoUrl(dto.getVideoUrl());
            if (dto.getDescription() != null) hw.setDescription(dto.getDescription());

            // 🔹 2. Attachmentni yangilash (agar mavjud bo‘lsa)
            if (dto.getAttachmentId() != null) {
                Attachment attachment = attachmentRepo.findById(dto.getAttachmentId())
                        .orElseThrow(() -> new RuntimeException("Attachment not found."));
                hw.setAttachment(attachment);
            }

            // 🔹 3. Lesson holatini tekshirish
            Lesson lesson = hw.getLesson();
            if (lesson.getIsPresent() == null || !lesson.getIsPresent()) {
                lesson.setIsPresent(true);
                lessonRepo.save(lesson);
            }

            // 🔹 4. Test bo‘lsa — yangilanish yoki qayta yozish
            if (dto.isHaveTest() && dto.getTest() != null && !dto.getTest().trim().isEmpty()) {
                // Eski testlarni o‘chirish
                if (hw.getTestHomework() != null && !hw.getTestHomework().isEmpty()) {
                    testHomeworkRepo.deleteAll(hw.getTestHomework());
                    hw.getTestHomework().clear();
                }

                List<TestHomework> batch = new ArrayList<>();
                String rawInput = dto.getTest();
                String test = rawInput;

                try {
                    ObjectMapper om = new ObjectMapper();
                    for (int round = 0; round < 2; round++) {
                        int firstBrace = test.indexOf('{');
                        int lastBrace = test.lastIndexOf('}');
                        if (firstBrace >= 0 && lastBrace > firstBrace) {
                            String maybeJson = test.substring(firstBrace, lastBrace + 1).trim();
                            if (maybeJson.contains("\"test\"")) {
                                JsonNode root = om.readTree(maybeJson);
                                JsonNode tNode = root.get("test");
                                if (tNode != null && !tNode.isNull()) {
                                    test = tNode.asText();
                                    continue;
                                }
                            }
                        }
                        break;
                    }
                } catch (Exception ignore) {}

                String normalized = test.replace("\r\n", "\n").trim();
                if (!normalized.isEmpty()) {
                    String[] blocks = normalized.split("(?m)^\\s*\\+{5,}\\s*$");

                    for (String rawBlock : blocks) {
                        String block = rawBlock.trim();
                        if (block.isEmpty()) continue;

                        String[] parts = block.split("(?m)^\\s*=+\\s*$");
                        List<String> cleaned = new ArrayList<>();
                        for (String p : parts) {
                            String t = p.trim();
                            if (!t.isEmpty()) cleaned.add(t);
                        }

                        if (cleaned.size() < 5) continue;

                        String question = cleaned.get(0);
                        List<String> options = new ArrayList<>();
                        String correct = null;

                        for (int i = 1; i < cleaned.size(); i++) {
                            String part = cleaned.get(i).trim();
                            if (part.isEmpty()) continue;

                            if (part.startsWith("#")) {
                                String dropHash = part.substring(1).trim();
                                if (!dropHash.isEmpty()) correct = dropHash;
                            } else {
                                options.add(part);
                            }
                        }

                        if (correct != null) options.add(0, correct);
                        while (options.size() < 4) options.add("");
                        if (options.size() > 4) options = options.subList(0, 4);

                        if (question.isEmpty() || options.get(0).isEmpty()) continue;

                        TestHomework row = TestHomework.builder()
                                .question(question)
                                .answer1(options.get(0))
                                .answer2(options.get(1))
                                .answer3(options.get(2))
                                .answer4(options.get(3))
                                .ball(dto.getBall())
                                .created(LocalDateTime.now())
                                .build();

                        batch.add(row);
                    }

                    if (!batch.isEmpty()) {
                        List<TestHomework> savedTests = testHomeworkRepo.saveAll(batch);
                        hw.setTestHomework(savedTests);
                        System.out.println("✅ Updated " + batch.size() + " test questions.");
                    }
                }
            }

            // 🔹 5. Homeworkni saqlash
            homeworkRepo.save(hw);
            return ResponseEntity.ok(hw);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Update error: " + e.getMessage());
        }
    }

    // Delete homework
    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteHomework(@PathVariable UUID id) {
        if (!homeworkRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Homework not found.");
        }
        homeworkRepo.deleteById(id);
        return ResponseEntity.ok("✅ Deleted");
    }
}

