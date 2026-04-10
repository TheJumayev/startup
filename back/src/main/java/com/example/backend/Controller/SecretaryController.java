package com.example.backend.Controller;
import com.example.backend.DTO.UserSave;
import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/secretary")
public class SecretaryController {
    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public SecretaryController(RoleRepo roleRepo, UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public HttpEntity<?> addAdmin(@RequestBody UserSave userSave) {
        if (userSave.getName() == null || userSave.getPassword() == null || userSave.getPhone() == null ||
                userSave.getName().isEmpty() || userSave.getPassword().isEmpty() || userSave.getPhone().isEmpty()) {
            return ResponseEntity.badRequest().body("Name, phone or password is missing");
        }

        Role adminRole = roleRepo.findByName(UserRoles.ROLE_SECRETARY);
        if (adminRole == null) {
            return ResponseEntity.badRequest().body("Admin role not found");
        }
        String encodedPassword = passwordEncoder.encode(userSave.getPassword());


        User user = new User(userSave.getPhone(), encodedPassword, userSave.getName(), Collections.singletonList(adminRole));
        User saved = userRepo.save(user);
        return ResponseEntity.ok(saved);
    }


    @GetMapping
    public HttpEntity<?> getAdmins() {
        List<User> allAdminsByRole = userRepo.findAllSecretaryByRole();
        return ResponseEntity.ok(allAdminsByRole);
    }


    @PutMapping("/{id}")
    public HttpEntity<?> updateAdmin(@PathVariable UUID id, @RequestBody UserSave userSave) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        if (userSave.getName() != null) user.setName(userSave.getName());
        if (userSave.getPhone() != null) user.setPhone(userSave.getPhone());
        if (userSave.getPassword() != null) {
            String encodedPassword = passwordEncoder.encode(userSave.getPassword());
            user.setPassword(encodedPassword);
        }
        User updated = userRepo.save(user);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteAdmin(@PathVariable UUID id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepo.deleteById(id);
        return ResponseEntity.ok("Admin deleted successfully");
    }
}
