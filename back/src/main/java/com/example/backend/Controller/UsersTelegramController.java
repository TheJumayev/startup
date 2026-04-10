package com.example.backend.Controller;

import com.example.backend.Entity.Student;
import com.example.backend.Entity.UsersTelegram;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.UsersTelegramRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/telegram-users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UsersTelegramController {

    private final UsersTelegramRepository repository;
    private final StudentRepo studentRepo;

    // =========================
    // CREATE
    // =========================
    @PostMapping
    public UsersTelegram create(@RequestBody UsersTelegramDTO request) {

        if (repository.findByTelegramId(request.getTelegramId()).isPresent()) {
            throw new RuntimeException("Telegram ID already exists");
        }

        UsersTelegram user = UsersTelegram.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .telegramId(request.getTelegramId())
                .phoneNumber(request.getPhoneNumber())
                .passportNumber(request.getPassportNumber())
                .hemisId(request.getHemisId())
                .password(request.getPassword())
                .isActive(request.getStatus() != null ? request.getStatus() : false)
                .isParent(request.getIsParent() != null ? request.getIsParent() : false) // NEW: set isParent
                .build();

        return repository.save(user);
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public List<UsersTelegram> getAll() {

        List<UsersTelegram> users = repository.findAll();

        for (UsersTelegram user : users) {

            // if student not linked but hemisId exists
            if (user.getStudent() == null && user.getHemisId() != null) {

                Optional<Student> studentOpt =
                        studentRepo.findByStudentIdNumber(user.getHemisId());

                studentOpt.ifPresent(user::setStudent);
                // ⚠️ we DO NOT call repository.save()
            }
        }

        return users;
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public UsersTelegram getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @PathVariable Long id,
            @RequestBody UsersTelegramDTO request) {

        UsersTelegram user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassportNumber(request.getPassportNumber());
        user.setHemisId(request.getHemisId());
        user.setPassword(request.getPassword());
        user.setIsParent(request.getIsParent()); // already present

        if (request.getStatus() != null) {

            user.setIsActive(request.getStatus());
            if (request.getStatus()){
                Optional<Student> byStudentIdNumber = studentRepo.findByStudentIdNumber(request.getHemisId());
                if (byStudentIdNumber.isEmpty())return ResponseEntity.notFound().build();
                user.setStudent(byStudentIdNumber.get());
            }
        }
        UsersTelegram save = repository.save(user);
        return ResponseEntity.ok(save);
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        repository.deleteById(id);
        return "User deleted successfully";
    }

    // =========================
    // UPDATE STATUS ONLY
    // =========================
    @PatchMapping("/{id}/status")
    public UsersTelegram updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean status) {

        UsersTelegram user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(status);
        return repository.save(user);
    }

    // ======================================================
    // INNER DTO CLASS
    // ======================================================
    @Data
    public static class UsersTelegramDTO {

        private String fullName;
        private String username;
        private Long telegramId;
        private String phoneNumber;
        private String passportNumber;
        private String hemisId;
        private String password;
        private Boolean status;
        private Boolean isParent; // already present

        private Student student;
    }
}