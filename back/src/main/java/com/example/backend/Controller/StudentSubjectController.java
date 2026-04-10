
package com.example.backend.Controller;

import com.example.backend.DTO.StudentSubjectPayedDto;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/student-subject")
public class StudentSubjectController {
    private final StudentRepo studentRepo;
    private final StudentSubjectRepo studentSubjectRepo;
    private final TemporarySubjectRepo temporarySubjectRepo;
    private final TestTemporarySubjectRepo testTemporarySubjectRepo;
    private final LessonRepo lessonRepo;
    private final LearningStudentSubjectRepo learningStudentSubjectRepo;
    private final CurriculumRepo curriculumRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;


    @GetMapping("/subjects")

    public ResponseEntity<?> getAllSubjects() {
        // 1. Barcha subjectlarni olish
        List<TemporarySubject> subjects = temporarySubjectRepo.findAll();

        // 2. SubjectId va unga tegishli testlar soni
        Map<UUID, Integer> subjectTestCounts = new HashMap<>();
        for (TemporarySubject subject : subjects) {
            System.out.println(subject);
            Integer count = testTemporarySubjectRepo.findBySubjectId(subject.getId()).size();
            subjectTestCounts.put(subject.getId(), count);
        }
        // 3. Natijani subject + count bilan qaytarish uchun DTO
        List<Map<String, Object>> result = new ArrayList<>();
        for (TemporarySubject subject : subjects) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", subject.getId());
            map.put("subjectName", subject.getSubjectName());
            map.put("created", subject.getCreated());
            map.put("testCount", subjectTestCounts.get(subject.getId()));
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/create-subject")
    public ResponseEntity<?> createSubject() {
        // 1) Source: unique subject names from student_subjects
        List<String> names = studentSubjectRepo.findAllUniqueSubjectNames();

        // 2) Load existing names once (normalized)
        Set<String> existingNorm = temporarySubjectRepo.findAllNormalizedNames();

        // 3) Normalize incoming names & de-duplicate within this request
        //    (trim -> collapse inner spaces -> keep original-casing text for saving)
        LinkedHashSet<String> uniqueClean = new LinkedHashSet<>();
        for (String raw : names) {
            if (raw == null) continue;
            String cleaned = raw.trim().replaceAll("\\s+", " ");
            if (!cleaned.isEmpty()) uniqueClean.add(cleaned);
        }

        // 4) Build batch only for names that are NOT already present
        int created = 0, skipped = 0;
        List<TemporarySubject> batch = new ArrayList<>();

        for (String valueToSave : uniqueClean) {
            String norm = valueToSave.toLowerCase(); // same normalization as repo query
            if (existingNorm.contains(norm)) {
                skipped++;
                continue; // already in DB -> do not save
            }
            // prepare for insert and also add to in-memory set to avoid duplicates in same run
            batch.add(TemporarySubject.builder()
                    .subjectName(valueToSave)        // keep original-casing for display
                    .created(java.time.LocalDateTime.now())
                    .build());
            existingNorm.add(norm); // protect from dupes within this batch
            created++;
        }

        if (!batch.isEmpty()) {
            temporarySubjectRepo.saveAll(batch);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("requested", names.size());
        payload.put("uniqueAfterClean", uniqueClean.size());
        payload.put("created", created);
        payload.put("skippedExisting", skipped);
        payload.put("sampleSaved", batch.stream().limit(10).toList());

        return ResponseEntity.ok(payload);
    }

    @PutMapping("/payment/{studentSubjectId}")
    public ResponseEntity<?> updateSubjectId(@PathVariable UUID studentSubjectId, @RequestBody StudentSubjectPayedDto studentSubject) {
        Optional<StudentSubject> byId = studentSubjectRepo.findById(studentSubjectId);
        if (byId.isPresent()) {
            StudentSubject studentSubject1 = byId.get();
            studentSubject1.setAmount(studentSubject.getAmount());
            studentSubject1.setPayed(true);
            studentSubject1.setPayedTime(LocalDateTime.now());
            StudentSubject save = studentSubjectRepo.save(studentSubject1);

            Student student = studentSubject1.getStudent();
            if (student.getGroup().getCurriculum() == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Optional<CurriculumSubject> byId1 = curriculumSubjectRepo.findById(studentSubject.getCurriculumSubjectId());
            if (byId1.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return ResponseEntity.ok(save);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/change-payment/{studentSubjectId}/{amount}")
    public ResponseEntity<?> changePayment(@PathVariable UUID studentSubjectId, @PathVariable Long amount) {
        Optional<StudentSubject> byId = studentSubjectRepo.findById(studentSubjectId);
        if (byId.isPresent()) {
            StudentSubject studentSubject1 = byId.get();
            studentSubject1.setAmount(amount);
            studentSubject1.setPayedTime(LocalDateTime.now());
            StudentSubject save = studentSubjectRepo.save(studentSubject1);
            return ResponseEntity.ok(save);
        }
        return ResponseEntity.notFound().build();
    }


//    @PutMapping("/payment/{studentSubjectId}")
//    public ResponseEntity<?> updateSubjectId(@PathVariable UUID studentSubjectId,
//                                             @RequestBody StudentSubjectPayedDto studentSubject) {
//        Optional<StudentSubject> byId = studentSubjectRepo.findById(studentSubjectId);
//        if (byId.isPresent()) {
//            StudentSubject studentSubject1 = byId.get();
//
//            // Eski summani olib, ustiga yangi summani qo‘shib qo‘yamiz
//            Double oldAmount = studentSubject1.getAmount() != null ? studentSubject1.getAmount() : 0.0;
//            Double newAmount = studentSubject.getAmount() != null ? studentSubject.getAmount() : 0.0;
//
//            studentSubject1.setAmount((long) (oldAmount + newAmount));
//            studentSubject1.setPayed(true);
//            studentSubject1.setPayedTime(LocalDateTime.now());
//
//            studentSubjectRepo.save(studentSubject1);
//            return ResponseEntity.ok(studentSubject1);
//        }
//        return ResponseEntity.notFound().build();
//    }


    @GetMapping("/debts")
    public ResponseEntity<?> getDebtStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var pageable = PageRequest.of(page, size);
        var resultPage = studentSubjectRepo.findAllDebtStudents(pageable);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("page", resultPage.getNumber());
        payload.put("size", resultPage.getSize());
        payload.put("totalElements", resultPage.getTotalElements());
        payload.put("totalPages", resultPage.getTotalPages());
        payload.put("items", resultPage.getContent());

        return ResponseEntity.ok(payload);
    }


    @GetMapping("/debts/all")
    public ResponseEntity<?> getAllDebtStudents() {
        List<StudentSubject> all = studentSubjectRepo.findAll();
        return ResponseEntity.ok(all);
    }


    @GetMapping("/debt/{studentId}")
    public ResponseEntity<?> getDebt(@PathVariable UUID studentId) {
        List<StudentSubject> subjects = studentSubjectRepo.findByStudentId(studentId);
        System.out.println("=======================");
        System.out.println(subjects);
        System.out.println(subjects.size());
        System.out.println("=======================");
        return ResponseEntity.ok(subjects);
    }


//    Lazizbek uchun


//    @GetMapping("/lesson/{studentId}/{subjectId}")
//    public ResponseEntity<?> getLesson(@PathVariable UUID subjectId) {
//
//
//
//
//    }
}
