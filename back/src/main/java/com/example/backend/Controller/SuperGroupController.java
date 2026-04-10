package com.example.backend.Controller;

import com.example.backend.DTO.SuperGroupRequest;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.SuperGroup;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.SuperGroupRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/super-group")
@RequiredArgsConstructor
public class SuperGroupController {

    private final SuperGroupRepo superGroupRepo;
    private final GroupsRepo groupsRepo;

    /* ================= CREATE ================= */

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SuperGroupRequest request) {

        Optional<Groups> mainGroupOpt = groupsRepo.findById(request.getMainGroupId());
        if (mainGroupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Main group not found");
        }

        List<Groups> subGroups = groupsRepo.findAllById(request.getSubGroupIds());

        SuperGroup superGroup = SuperGroup.builder()
                .mainGroup(mainGroupOpt.get())
                .subGroups(subGroups)
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(superGroupRepo.save(superGroup));
    }

    /* ================= READ ALL ================= */

    @GetMapping
    public ResponseEntity<List<SuperGroup>> getAll() {
        return ResponseEntity.ok(superGroupRepo.findAll());
    }

    /* ================= READ BY ID ================= */

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        return superGroupRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ================= UPDATE ================= */

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @RequestBody SuperGroupRequest request
    ) {

        Optional<SuperGroup> optional = superGroupRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SuperGroup superGroup = optional.get();

        Groups mainGroup = groupsRepo.findById(request.getMainGroupId())
                .orElseThrow(() -> new RuntimeException("Main group not found"));

        List<Groups> subGroups = groupsRepo.findAllById(request.getSubGroupIds());

        superGroup.setMainGroup(mainGroup);
        superGroup.setSubGroups(subGroups);

        return ResponseEntity.ok(superGroupRepo.save(superGroup));
    }

    /* ================= DELETE ================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {

        if (!superGroupRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        superGroupRepo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}