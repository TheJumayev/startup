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
    public ResponseEntity<GroupsDTO> create(@RequestBody GroupsDTO dto) {
        Groups groups = Groups.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .semesterName(dto.getSemesterName())
                .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now())
                .build();

        Groups saved = groupsRepo.save(groups);
        GroupsDTO result = new GroupsDTO(saved.getId(), saved.getName(), saved.getDescription(), saved.getSemesterName(), saved.getCreatedAt());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupsDTO> update(
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

        Groups updated = groupsRepo.save(groups);
        GroupsDTO result = new GroupsDTO(updated.getId(), updated.getName(), updated.getDescription(), updated.getSemesterName(), updated.getCreatedAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupsDTO> getById(@PathVariable UUID id) {
        Groups groups = groupsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));
        GroupsDTO result = new GroupsDTO(groups.getId(), groups.getName(), groups.getDescription(), groups.getSemesterName(), groups.getCreatedAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<GroupsDTO>> getAll() {
        List<Groups> groups = groupsRepo.findAll();
        List<GroupsDTO> dtos = groups.stream()
                .map(g -> new GroupsDTO(g.getId(), g.getName(), g.getDescription(), g.getSemesterName(), g.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(dtos);
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

