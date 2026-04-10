package com.example.backend.Controller;

import com.example.backend.Entity.Student;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student-achievements")
@RequiredArgsConstructor
@CrossOrigin
public class StudentAchievementsController {

    private final StudentRepo studentRepo;

    /* ================= GET ALL ================= */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getAchievements(@PathVariable UUID studentId) {

        Optional<Student> optionalStudent = studentRepo.findById(studentId);
        if (optionalStudent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                optionalStudent.get().getStudentAchievements()
        );
    }

    /* ================= REPLACE FULL LIST ================= */
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateAchievements(@PathVariable UUID studentId,
                                                @RequestBody List<String> achievements) {

        Optional<Student> optionalStudent = studentRepo.findById(studentId);
        if (optionalStudent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = optionalStudent.get();
        student.setStudentAchievements(achievements);
        studentRepo.save(student);

        return ResponseEntity.ok(student.getStudentAchievements());
    }

    /* ================= ADD ONE ================= */
    @PostMapping("/{studentId}")
    public ResponseEntity<?> addAchievement(@PathVariable UUID studentId,
                                            @RequestBody String achievement) {

        Optional<Student> optionalStudent = studentRepo.findById(studentId);
        if (optionalStudent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = optionalStudent.get();

        if (student.getStudentAchievements() == null) {
            student.setStudentAchievements(new ArrayList<>());
        }

        student.getStudentAchievements().add(achievement);
        studentRepo.save(student);

        return ResponseEntity.ok(student.getStudentAchievements());
    }

    /* ================= DELETE ONE ================= */
    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteAchievement(@PathVariable UUID studentId,
                                               @RequestBody String achievement) {

        Optional<Student> optionalStudent = studentRepo.findById(studentId);
        if (optionalStudent.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = optionalStudent.get();

        if (student.getStudentAchievements() != null) {
            student.getStudentAchievements().remove(achievement);
            studentRepo.save(student);
        }

        return ResponseEntity.ok(student.getStudentAchievements());
    }
}