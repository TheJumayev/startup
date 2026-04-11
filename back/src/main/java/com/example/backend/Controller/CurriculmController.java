package com.example.backend.Controller;

import com.example.backend.DTO.CurriculmDTO;
import com.example.backend.Entity.Curriculm;
import com.example.backend.Entity.User;
import com.example.backend.Repository.CurriculmRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.SubjectsRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/curriculums")
public class CurriculmController {



    private final CurriculmRepo curriculumRepo;
    private final UserRepo userRepo;
    private final SubjectsRepo subjectsRepo;
    private final GroupsRepo groupsRepo;

    @PostMapping
    public ResponseEntity<CurriculmDTO> create(@RequestBody CurriculmDTO dto) {
        Curriculm curriculm = Curriculm.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .user(dto.getUserId() != null ? userRepo.findById(dto.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found")) : null)
                .subjects(dto.getSubjectsId() != null ? subjectsRepo.findById(dto.getSubjectsId())
                        .orElseThrow(() -> new RuntimeException("Subject not found")) : null)
                .groups(dto.getGroupsId() != null ? groupsRepo.findById(dto.getGroupsId())
                        .orElseThrow(() -> new RuntimeException("Group not found")) : null)
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        Curriculm saved = curriculumRepo.save(curriculm);
        CurriculmDTO result = mapToCurriculmDTO(saved);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CurriculmDTO> update(
            @PathVariable UUID id,
            @RequestBody CurriculmDTO dto
    ) {
        Curriculm curriculm = curriculumRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curriculm not found with id: " + id));

        if (dto.getName() != null) {
            curriculm.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            curriculm.setDescription(dto.getDescription());
        }

        if (dto.getUserId() != null) {
            curriculm.setUser(userRepo.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found")));
        }

        if (dto.getSubjectsId() != null) {
            curriculm.setSubjects(subjectsRepo.findById(dto.getSubjectsId())
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
        }

        if (dto.getGroupsId() != null) {
            curriculm.setGroups(groupsRepo.findById(dto.getGroupsId())
                    .orElseThrow(() -> new RuntimeException("Group not found")));
        }

        if (dto.getCreateAt() != null) {
            curriculm.setCreateAt(dto.getCreateAt());
        }

        Curriculm updated = curriculumRepo.save(curriculm);
        CurriculmDTO result = mapToCurriculmDTO(updated);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculmDTO> getById(@PathVariable UUID id) {
        Curriculm curriculm = curriculumRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Curriculm not found with id: " + id));
        CurriculmDTO result = mapToCurriculmDTO(curriculm);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<CurriculmDTO>> getAll() {
        List<Curriculm> curriculms = curriculumRepo.findAll();
        List<CurriculmDTO> dtos = curriculms.stream()
                .map(this::mapToCurriculmDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CurriculmDTO>> getByUserId(@PathVariable UUID userId) {
        Optional<User> userOptional = userRepo.findById(userId);
        if(userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOptional.get();
        List<Curriculm> curriculms = curriculumRepo.findByUserId(user.getId());
        List<CurriculmDTO> dtos = curriculms.stream()
                .map(this::mapToCurriculmDTO)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!curriculumRepo.existsById(id)) {
            throw new RuntimeException("Curriculm not found with id: " + id);
        }
        curriculumRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CurriculmDTO mapToCurriculmDTO(Curriculm curriculm) {
        return new CurriculmDTO(
                curriculm.getId(),
                curriculm.getName(),
                curriculm.getDescription(),
                curriculm.getUser() != null ? curriculm.getUser().getId() : null,
                curriculm.getSubjects() != null ? curriculm.getSubjects().getId() : null,
                curriculm.getGroups() != null ? curriculm.getGroups().getId() : null,
                curriculm.getCreateAt()
        );
    }
}

