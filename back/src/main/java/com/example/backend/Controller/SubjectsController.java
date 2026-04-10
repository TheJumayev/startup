package com.example.backend.Controller;

import com.example.backend.DTO.SubjectsDTO;
import com.example.backend.Entity.Subjects;
import com.example.backend.Repository.SubjectsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/subjects")
public class SubjectsController {

    private final SubjectsRepo subjectsRepo;

    @PostMapping
    public ResponseEntity<Subjects> create(@RequestBody SubjectsDTO dto) {
        Subjects subject = Subjects.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        return ResponseEntity.ok(subjectsRepo.save(subject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subjects> update(
            @PathVariable UUID id,
            @RequestBody SubjectsDTO dto
    ) {
        Subjects subject = subjectsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));

        if (dto.getName() != null) {
            subject.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            subject.setDescription(dto.getDescription());
        }

        if (dto.getCreateAt() != null) {
            subject.setCreateAt(dto.getCreateAt());
        }

        return ResponseEntity.ok(subjectsRepo.save(subject));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subjects> getById(@PathVariable UUID id) {
        Subjects subject = subjectsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        return ResponseEntity.ok(subject);
    }

    @GetMapping
    public ResponseEntity<List<Subjects>> getAll() {
        return ResponseEntity.ok(subjectsRepo.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!subjectsRepo.existsById(id)) {
            throw new RuntimeException("Subject not found with id: " + id);
        }
        subjectsRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

