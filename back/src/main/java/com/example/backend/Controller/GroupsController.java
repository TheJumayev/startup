package com.example.backend.Controller;

import com.example.backend.DTO.GroupsDTO;
import com.example.backend.Entity.Groups;
import com.example.backend.Repository.GroupsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/groups")
public class GroupsController {

    private final GroupsRepo groupsRepo;

    @PostMapping
    public ResponseEntity<Groups> create(@RequestBody GroupsDTO dto) {
        Groups groups = Groups.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .semesterName(dto.getSemesterName())
                .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now())
                .build();

        return ResponseEntity.ok(groupsRepo.save(groups));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Groups> update(
            @PathVariable UUID id,
            @RequestBody GroupsDTO dto
    ) {
        Groups groups = groupsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));

        if (dto.getName() != null) {
            groups.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            groups.setDescription(dto.getDescription());
        }

        if (dto.getSemesterName() != null) {
            groups.setSemesterName(dto.getSemesterName());
        }

        if (dto.getCreatedAt() != null) {
            groups.setCreatedAt(dto.getCreatedAt());
        }

        return ResponseEntity.ok(groupsRepo.save(groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Groups> getById(@PathVariable UUID id) {
        Groups groups = groupsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));
        return ResponseEntity.ok(groups);
    }

    @GetMapping
    public ResponseEntity<List<Groups>> getAll() {
        return ResponseEntity.ok(groupsRepo.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!groupsRepo.existsById(id)) {
            throw new RuntimeException("Group not found with id: " + id);
        }
        groupsRepo.deleteById(id);
        return ResponseEntity.noContent().build();


    }
}

