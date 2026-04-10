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
    public ResponseEntity<SubjectsDTO> create(@RequestBody SubjectsDTO dto) {
        Subjects subject = Subjects.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        Subjects saved = subjectsRepo.save(subject);
        SubjectsDTO result = new SubjectsDTO(saved.getId(), saved.getName(), saved.getDescription(), saved.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectsDTO> update(
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

        Subjects updated = subjectsRepo.save(subject);
        SubjectsDTO result = new SubjectsDTO(updated.getId(), updated.getName(), updated.getDescription(), updated.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectsDTO> getById(@PathVariable UUID id) {
        Subjects subject = subjectsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        SubjectsDTO result = new SubjectsDTO(subject.getId(), subject.getName(), subject.getDescription(), subject.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<SubjectsDTO>> getAll() {
        List<Subjects> subjects = subjectsRepo.findAll();
        List<SubjectsDTO> dtos = subjects.stream()
                .map(s -> new SubjectsDTO(s.getId(), s.getName(), s.getDescription(), s.getCreateAt()))
                .toList();
        return ResponseEntity.ok(dtos);
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

