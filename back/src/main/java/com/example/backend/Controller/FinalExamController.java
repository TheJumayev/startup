package com.example.backend.Controller;

import com.example.backend.DTO.FinalExamDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/final-exam")
public class FinalExamController {

    private final FinalExamRepo finalExamRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final UserRepo userRepo;
    private final GroupsRepo groupsRepo;
    private final StudentRepo studentRepo;
    private final FinalExamStudentRepo finalExamStudentRepo;
    private final FinalExamStudentHistoryRepo finalExamStudentHistoryRepo;
    // 🔵 GET ALL EXAMS
    @GetMapping
    public HttpEntity<?> getFinalExams() {
        return ResponseEntity.ok(finalExamRepo.findAll());
    }
    @GetMapping("/filter")
    public HttpEntity<?> getFinalExamsFilter(
            @RequestParam String semesterCode,
            @RequestParam UUID groupId,
            @RequestParam(required = false) LocalDate createdAt,
            @RequestParam(required = false) String subjectName
    ) {

        List<FinalExam> all = finalExamRepo.findAllFilter(
                semesterCode,
                groupId
        );

        return ResponseEntity.ok(all);
    }
    @GetMapping("/statusForView/{finalId}")
    public HttpEntity<?> getFinalExamStatus(@PathVariable UUID finalId) {
        Optional<FinalExam> byId = finalExamRepo.findById(finalId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FinalExam finalExam = byId.get();
        finalExam.setStatus(!finalExam.getStatus());
        FinalExam save = finalExamRepo.save(finalExam);
        return ResponseEntity.ok(save);
    }
    @PutMapping("/finalExam/{finalExamId}")
    public HttpEntity<?> changeStatus(@PathVariable UUID finalExamId){
        Optional<FinalExam> byId = finalExamRepo.findById(finalExamId);
        if(byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Boolean finalExam = byId.get().getStatus();
        byId.get().setStatus(!finalExam);
        FinalExam save = finalExamRepo.save(byId.get());
        return ResponseEntity.ok(save);
    }
    // 🔵 GET exam by ID
    @GetMapping("/{id}")
    public HttpEntity<?> getOne(@PathVariable UUID id) {
        Optional<FinalExam> byId = finalExamRepo.findById(id);
        if (byId.isPresent()) {
            return ResponseEntity.ok(byId.get());
        }
        return ResponseEntity.notFound().build();
    }
    // 🔵 GET by subject + group
    @GetMapping("/by-subject-group/{subjectId}/{groupId}")
    public HttpEntity<?> getBySubjectAndGroup(@PathVariable UUID subjectId, @PathVariable UUID groupId) {
        Optional<FinalExam> exam = finalExamRepo.findByCurriculumSubjectIdAndGroupId(subjectId, groupId);
        if (exam.isPresent()) {
            return ResponseEntity.ok(exam.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
    }
    // 🔵 CREATE FinalExam
    @PostMapping
    public HttpEntity<?> addFinalExam(@RequestBody FinalExamDTO dto) {
        Optional<CurriculumSubject> curriculumSubject = curriculumSubjectRepo.findById(dto.getCurriculumSubjectId());
        List<User> teacher = userRepo.findAllTestCenterByRole();
        Optional<Groups> group = groupsRepo.findById(dto.getGroupId());
        if (curriculumSubject.isEmpty() || teacher.size()==0 || group.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid IDs given");
        }
        // 🔒 UNIQUE CHECK — prevent duplicate exam for same subject+group
        Optional<FinalExam> existing = finalExamRepo
                .findByCurriculumSubjectIdAndGroupId(dto.getCurriculumSubjectId(), dto.getGroupId());

        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Exam for this subject and group ALREADY exists!");
        }

        try {
            FinalExam exam = new FinalExam(
                    dto.getName(),
                    curriculumSubject.get(),
                    teacher.get(0),
                    group.get(),
                    dto.getQuestionCount(),
                    dto.getMaxBall(),
                    dto.getAttempts(),
                    false,
                    1,
                    dto.getStartTime(),
                    dto.getEndTime(),
                    LocalDateTime.now(),
                    dto.getDuration(),
                    dto.getIsAmaliy(),
                    dto.getIsAmaliyot(),
                    dto.getContract()
            );
            FinalExam saved = finalExamRepo.save(exam);
            return ResponseEntity.ok(saved);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Duplicate exam (subject + group must be unique)");
        }
    }

    // 🔵 UPDATE exam
    @PutMapping("/{id}")
    public HttpEntity<?> updateExam(@PathVariable UUID id, @RequestBody FinalExamDTO dto) {
        Optional<FinalExam> examOptional = finalExamRepo.findById(id);
        if (examOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
        }

        FinalExam exam = examOptional.get();
        Optional<CurriculumSubject> curriculumSubject = curriculumSubjectRepo.findById(dto.getCurriculumSubjectId());
        List<User> teacher = userRepo.findAllTestCenterByRole();
        Optional<Groups> group = groupsRepo.findById(dto.getGroupId());
        if (curriculumSubject.isEmpty() || teacher.size()==0 || group.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid IDs provided");
        }
        // If subject or group changed → check uniqueness
        if (!exam.getCurriculumSubject().getId().equals(dto.getCurriculumSubjectId()) ||
                !exam.getGroup().getId().equals(dto.getGroupId())) {
            Optional<FinalExam> duplicateCheck =
                    finalExamRepo.findByCurriculumSubjectIdAndGroupId(dto.getCurriculumSubjectId(), dto.getGroupId());
            if (duplicateCheck.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Another exam with same subject+group already exists!");
            }
        }
        exam.setName(dto.getName());
        exam.setCurriculumSubject(curriculumSubject.get());
        exam.setUser(teacher.get(0));
        exam.setGroup(group.get());
        exam.setQuestionCount(dto.getQuestionCount());
        exam.setMaxBall(dto.getMaxBall());
        exam.setAttempts(dto.getAttempts());
        exam.setDuration(dto.getDuration());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setIsAmaliy(dto.getIsAmaliy());
        exam.setIsAmaliyot(dto.getIsAmaliyot());
        exam.setContract(dto.getContract());
        finalExamRepo.save(exam);
        return ResponseEntity.ok("Updated successfully");
    }

    // 🔵 DELETE exam
    @Transactional
    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteExam(@PathVariable UUID id) {

        if (!finalExamRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
        }
        finalExamStudentHistoryRepo.deleteByFinalExamId(id);
        finalExamStudentRepo.deleteByFinalExamId(id);
        finalExamRepo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }

}
