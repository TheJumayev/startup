package com.example.backend.Controller;

import com.example.backend.DTO.StudentDTO;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentRepo studentRepo;
    private final GroupsRepo groupsRepo;

    @PostMapping
    public ResponseEntity<Student> create(@RequestBody StudentDTO dto) {
        Student student = Student.builder()
                .fullName(dto.getFullName())
                .groups(dto.getGroupsId() != null ? groupsRepo.findById(dto.getGroupsId())
                        .orElseThrow(() -> new RuntimeException("Group not found")) : null)
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        return ResponseEntity.ok(studentRepo.save(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> update(
            @PathVariable UUID id,
            @RequestBody StudentDTO dto
    ) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        if (dto.getFullName() != null) {
            student.setFullName(dto.getFullName());
        }

        if (dto.getGroupsId() != null) {
            student.setGroups(groupsRepo.findById(dto.getGroupsId())
                    .orElseThrow(() -> new RuntimeException("Group not found")));
        }

        if (dto.getCreateAt() != null) {
            student.setCreateAt(dto.getCreateAt());
        }

        return ResponseEntity.ok(studentRepo.save(student));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable UUID id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        return ResponseEntity.ok(student);
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(studentRepo.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!studentRepo.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

