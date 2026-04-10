package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/mustaqil-exam-student")
public class MustaqilTalimStudentController {
    private final MustaqilExamRepo mustaqilExamRepo;
    private final StudentRepo studentRepo;
    private final MustaqilTalimCreateRepo mustaqilTalimCreateRepo;
    private final MustaqilTalimStudentRepo mustaqilTalimStudentRepo;
    private final StudentCompleteMustaqilTalimRepo studentCompleteMustaqilTalimRepo;
    private final MustaqilExamStudentTestRepo mustaqilExamStudentTestRepo;
    private final TestMustaqilTalimRepo testMustaqilTalimRepo;

    @PutMapping("/ball/{mustaqilExamStudentId}/{ball}")
    public ResponseEntity<?> updateFinalBall(@PathVariable UUID mustaqilExamStudentId, @PathVariable Integer ball) {
        Optional<MustaqilTalimStudent> studentExam = mustaqilTalimStudentRepo.findById(mustaqilExamStudentId);
        if (studentExam.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MustaqilTalimStudent mustaqilExamStudent = studentExam.get();
        mustaqilExamStudent.setBall(ball);
        MustaqilTalimStudent save = mustaqilTalimStudentRepo.save(mustaqilExamStudent);
        return ResponseEntity.ok(save);
    }

    @GetMapping("/one/{id}")
    public  HttpEntity<?> getStudentSubjects(@PathVariable UUID id){
        Optional<MustaqilTalimStudent> students = mustaqilTalimStudentRepo.findById(id);

        if (students.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(students);

    }    @GetMapping("/studentSubjects/{studentId}")
    public  HttpEntity<?> getStudentSubjectsOne(@PathVariable UUID studentId){
        List<MustaqilTalimStudent> students = mustaqilTalimStudentRepo.findByStudentId(studentId);

        if (students.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(students);

    }


    @GetMapping("/start-test/{finalExamStudentId}")
    public HttpEntity<?> startTest(
            @PathVariable UUID finalExamStudentId,
            HttpServletRequest request
    ) {

        Optional<MustaqilTalimStudent> byId = mustaqilTalimStudentRepo.findById(finalExamStudentId);
        if (byId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found!");
        }

        MustaqilTalimStudent student = byId.get();
        MustaqilExam finalExam = student.getMustaqilExam();

        int allowedAttempts = finalExam.getAttempts();
        int usedAttempt = student.getAttempt() == null ? 0 : student.getAttempt();
        // ===== ❗️ Student already passed =====
        if (Boolean.TRUE.equals(student.getIsPassed())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Siz testdan o'tgansiz");
        }
        // ===== ❗️ Time check =====
        if (LocalDateTime.now().isAfter(finalExam.getEndTime())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Exam time is over!");
        }
        // ===== ❗️ Permission check =====
        if (!student.getExamPermission()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to start the exam!");
        }
        // ===== CASE 1: Student continuing same attempt =====
        // ❗️ TO‘G‘RI TEKSHIRISH → endTime == null
        if (usedAttempt >= 1 && student.getEndTime() == null) {
            List<MustaqilExamStudentTest> oldTests = mustaqilExamStudentTestRepo.findByMustaqilExamStudentId(finalExamStudentId);
            return ResponseEntity.ok(oldTests);
        }
        // ===== CASE 2: All attempts used =====
        if (usedAttempt >= allowedAttempts) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No attempts remaining.");
        }
        // ===== CASE 3: Student finished last attempt → New attempt =====
        if (usedAttempt >= 1) {
            // 1) Save to history

            // 2) Delete old tests
            List<MustaqilExamStudentTest> old = mustaqilExamStudentTestRepo.findByMustaqilExamStudentId(finalExamStudentId);
            mustaqilExamStudentTestRepo.deleteAll(old);
            // 3) Reset fields
            student.setCorrectCount(0);
            student.setWrongCount(0);
            student.setBall(0);
            student.setIsPassed(null);
            student.setStartTime(LocalDateTime.now());
            student.setEndTime(null);
        }
        System.out.printf("6");
        // ===== UPDATE attempt =====
        student.setAttempt(usedAttempt + 1);
        student.setStartTime(LocalDateTime.now());
        student.setEndTime(null);
        mustaqilTalimStudentRepo.save(student);

//        // ===== Generate new test questions =====
//        List<TestMustaqilTalim> all = testMustaqilTalimRepo
//                .findByCurriculumSubjectId();

        List<MustaqilTalimCreate> optMustaqilTalimCreate = mustaqilTalimCreateRepo.findByCurriculumSubjectId(finalExam.getCurriculumSubject().getId());
        if (optMustaqilTalimCreate.isEmpty())return ResponseEntity.notFound().build();
        List<TestMustaqilTalim> all = new ArrayList<>();
        for (MustaqilTalimCreate mustaqilTalimCreate : optMustaqilTalimCreate) {
            all.addAll(mustaqilTalimCreate.getTestMustaqilTalim());
        }
        int questionCount = Math.min(finalExam.getQuestionCount(), all.size());

        Collections.shuffle(all);
        List<TestMustaqilTalim> selected = all.subList(0, questionCount);

        List<MustaqilExamStudentTest> newTests = new ArrayList<>();

        for (TestMustaqilTalim q : selected) {
            List<String> answers = new ArrayList<>(Arrays.asList(
                    q.getAnswer1(), q.getAnswer2(), q.getAnswer3(), q.getAnswer4()
            ));

            Collections.shuffle(answers);

            int correctIndex = answers.indexOf(q.getAnswer1()) + 1;

            MustaqilExamStudentTest test = new MustaqilExamStudentTest(
                    finalExamStudentId,
                    q,
                    null,
                    null,
                    null,
                    q.getQuestion(),
                    answers,
                    correctIndex
            );

            mustaqilExamStudentTestRepo.save(test);
            newTests.add(test);
        }

        return ResponseEntity.ok(newTests);
    }

    @PutMapping("/student-status/{mustaqilExamId}")
    public ResponseEntity<?> updateMustaqilExam(@PathVariable UUID mustaqilExamId){
        Optional<MustaqilTalimStudent> mustaqilTalimStudent = mustaqilTalimStudentRepo.findById(mustaqilExamId);
        if(mustaqilTalimStudent.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        MustaqilTalimStudent mustaqilTalimStudent1 = mustaqilTalimStudent.get();
        mustaqilTalimStudent1.setStatus(!mustaqilTalimStudent1.getStatus());
        MustaqilTalimStudent save = mustaqilTalimStudentRepo.save(mustaqilTalimStudent1);
        return ResponseEntity.ok(save);

    }

    @PutMapping("/permission/{mustaqilExamId}")
    public ResponseEntity<?> permissionStudents(@PathVariable UUID mustaqilExamId) {

        MustaqilExam exam = mustaqilExamRepo.findById(mustaqilExamId)
                .orElseThrow(() -> new RuntimeException("Mustaqil exam not found"));

        UUID groupId = exam.getGroup().getId();
        UUID curriculumSubjectId = exam.getCurriculumSubject().getId();
        String groupName = exam.getGroup().getName();

        List<Student> students = studentRepo.findAllByGroupId(groupId);

        long total =
                mustaqilTalimCreateRepo
                        .countByCurriculumSubject_Id(curriculumSubjectId);
        List<MustaqilExamPermissionRow> table = new ArrayList<>();

        for (Student s : students) {
            long completed =
                    studentCompleteMustaqilTalimRepo
                            .countCompletedDistinctTopics(
                                    s.getId(),
                                    curriculumSubjectId
                            );

            boolean permission = completed >= total;
            // 🔹 Test holati
            String testStatus;
            if (completed < 10) {
                testStatus = "Mustaqil ta’lim vazifalari yakunlanmagan! ("
                        + completed + "/" + total + ")";
            } else {
                testStatus = "Ruxsat";
            }


            Integer ball = 0 ;
            UUID finalExamStudentId = null;
            Optional<MustaqilTalimStudent> checkMustaqilTalimStudent = mustaqilTalimStudentRepo.findByStudentIdAndMustaqilExam(s.getId(), exam.getId());
            if (checkMustaqilTalimStudent.isEmpty()){
                mustaqilTalimStudentRepo.save(new MustaqilTalimStudent(s, exam, 0, false,permission, LocalDateTime.now()));
            }else {
                MustaqilTalimStudent mustaqilTalimStudent = checkMustaqilTalimStudent.get();
                    ball = mustaqilTalimStudent.getBall();
                    finalExamStudentId = mustaqilTalimStudent.getId();
                if (mustaqilTalimStudent.getAttempt()==0){
                    mustaqilTalimStudent.setExamPermission(permission);
                    mustaqilTalimStudentRepo.save(mustaqilTalimStudent);
                }

            }

            table.add(new MustaqilExamPermissionRow(
                    finalExamStudentId,
                    s,
                    testStatus,
                    groupName,
                    ball,
                    completed + "/" + total,
                    permission
            ));

        }

        exam.setStatus(true);
        mustaqilExamRepo.save(exam);

        return ResponseEntity.ok(table);
    }

    @Data
    @AllArgsConstructor
    public static class MustaqilExamPermissionRow {
        private UUID finalExamStudentId;
        private Student student;          // Talaba
        private String testStatus;       // Test holati
        private String group;            // Guruh
        private Integer ball;
        private String scores;           // Baholar
        private Boolean examPermission;  // Imtihonga ruxsat
    }


}
