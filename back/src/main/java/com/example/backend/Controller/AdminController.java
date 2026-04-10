package com.example.backend.Controller;

import com.example.backend.DTO.UserDTO;
import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/admin/users")
public class AdminController {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;

    // CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody UserDTO dto) {
        if (dto.getPhone() == null || dto.getPhone().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Phone bo'sh bo'lishi mumkin emas");
        }
        if (userRepo.findByPhone(dto.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Bu phone allaqachon mavjud");
        }

        List<Role> roles = (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty())
                ? roleRepo.findAllById(dto.getRoleIds())
                : List.of();

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword()
                : "00000000";

        User user = User.builder()
                .phone(dto.getPhone())
                .password(passwordEncoder.encode(rawPassword))
                .name(dto.getName())
                .roles(roles)
                .created_at(LocalDateTime.now())
                .build();

        User saved = userRepo.save(user);
        return ResponseEntity.ok(toDTO(saved));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        List<UserDTO> list = userRepo.findAll().stream().map(this::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        User user = userRepo.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User topilmadi");
        }
        return ResponseEntity.ok(toDTO(user));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody UserDTO dto) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User topilmadi");
        }

        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            user.setRoles(roleRepo.findAllById(dto.getRoleIds()));
        }

        User updated = userRepo.save(user);
        return ResponseEntity.ok(toDTO(updated));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!userRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Entity -> DTO
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setPhone(user.getPhone());
        dto.setName(user.getName());
        dto.setRoleIds(user.getRoles() != null
                ? user.getRoles().stream().map(Role::getId).toList()
                : List.of());
        return dto;
    }
}
