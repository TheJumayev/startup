package com.example.backend.Controller;


import com.example.backend.DTO.StudentExplanationDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentExplanation;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.StudentExplanationRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/student-explanation")
@RequiredArgsConstructor
public class StudentExplanationController {
    private final StudentRepo studentRepo;
    private final StudentExplanationRepo studentExplanationRepo;
    private final AttachmentRepo attachmentRepo;

    @PostMapping
    public HttpEntity<?> addExplanation(@RequestBody StudentExplanationDTO dto) {
        Optional<Student> studentOpt = studentRepo.findById(dto.getStudentId());
        if (studentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Optional<Attachment> attachmentOpt = attachmentRepo.findById(dto.getExplanationFileId());
        if (attachmentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        StudentExplanation explanation = StudentExplanation.builder()
                .student(studentOpt.get())
                .file(attachmentOpt.get())
                .status(dto.getStatus())   // 1,2,3
                .createdAt(LocalDateTime.now())
                .build();

        StudentExplanation save = studentExplanationRepo.save(explanation);
        return ResponseEntity.ok(save);
    }
    @GetMapping("/student/{studentId}")
    public HttpEntity<?> getByStudent(@PathVariable UUID studentId) {
        List<StudentExplanation> list = studentExplanationRepo.findByStudentId(studentId);
        return ResponseEntity.ok(list);
    }
    @PutMapping("/{id}")
    public HttpEntity<?> editExplanation(@PathVariable UUID id, @RequestBody StudentExplanationDTO dto) {
        Optional<Student> studentOpt = studentRepo.findById(dto.getStudentId());
        if (studentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Optional<Attachment> attachmentOpt = attachmentRepo.findById(dto.getExplanationFileId());
        if (attachmentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<StudentExplanation> explanationOpt = studentExplanationRepo.findById(id);
        if (explanationOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        StudentExplanation studentExplanation = explanationOpt.get();
        studentExplanation.setFile(attachmentOpt.get());
        studentExplanation.setStatus(dto.getStatus());
        StudentExplanation save = studentExplanationRepo.save(studentExplanation);
        return ResponseEntity.ok(save);
    }

    @GetMapping
    public HttpEntity<?> getAllExplanation() {
        List<StudentExplanation> studentExplanations = studentExplanationRepo.findAll();
        return ResponseEntity.ok(studentExplanations);
    }

    @GetMapping("/one/{id}")
    public HttpEntity<?> getOneExplanation(@PathVariable UUID id) {
        Optional<StudentExplanation> studentExplanation = studentExplanationRepo.findById(id);
        if (studentExplanation.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(studentExplanation.get());
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteExplanation(@PathVariable UUID id) {
        Optional<StudentExplanation> studentExplanation = studentExplanationRepo.findById(id);
        if (studentExplanation.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        studentExplanationRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

}
