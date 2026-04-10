package com.example.backend.Controller;

import com.example.backend.DTO.UserSave;
import com.example.backend.Entity.Role;
import com.example.backend.Entity.Teacher;
import com.example.backend.Entity.User;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.TeacherRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
@RestController
@RequestMapping("/api/v1/teacher")
@RequiredArgsConstructor
public class TeacherController {
    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final TeacherRepo teacherRepo;
    @GetMapping("/hemis-teacher-update")
    public HttpEntity<?> hemisTeacherUpdate() {
        System.out.println("hemisTeacherUpdate");
        List<Teacher> allTeachers = teacherRepo.findAll();
        Role teacherRole = roleRepo.findByName(UserRoles.ROLE_TEACHER);
        if (teacherRole == null) {
            return ResponseEntity.badRequest().body("Teacher role not found");
        }
        for (Teacher teacher : allTeachers) {
            String fullName = teacher.getFullName();
            if (fullName == null || fullName.trim().isEmpty()) continue;
            // 1) Login yaratish
            String login = generateLogin(fullName);  // ism_familya
            // 2) login bandmi? → mavjud userni olamiz
            Optional<User> optionalUser = userRepo.findByPhone(login);

            if (optionalUser.isPresent()) {
                // 🔥 USER BOR — FAQAT UPDATE QILAMIZ
                User existingUser = optionalUser.get();

                existingUser.setName(fullName);
                userRepo.save(existingUser);

                teacher.setUser(existingUser);
                teacherRepo.save(teacher);

                continue; // ❗️ yangi user yaratilmaydi
            }

            // 3) User yo‘q → Yangi yaratamiz
            String encodedPassword = passwordEncoder.encode(login + "1");

            User newUser = new User(
                    login,
                    encodedPassword,
                    fullName,
                    Collections.singletonList(teacherRole)
            );

            User savedUser = userRepo.save(newUser);

            // 4) Teacherga biriktiramiz
            teacher.setUser(savedUser);
            teacherRepo.save(teacher);
        }

        return ResponseEntity.ok("Teacher accounts updated successfully");
    }
    public String generateLogin(String fullName) {
        fullName = fullName.trim().replaceAll("\\s+", " ");
        String[] arr = fullName.split(" ");
        if (arr.length < 2) return "unknown";

        String familya = translit(arr[0]).toLowerCase();
        String ism = translit(arr[1]).toLowerCase();

        return ism + "_" + familya;
    }
    public String translit(String s) {
        return s
                .replace("O‘", "o")
                .replace("O'", "o")
                .replace("G‘", "g")
                .replace("G'", "g")
                .replace("o‘", "o")
                .replace("o'", "o")
                .replace("g‘", "g")
                .replace("g'", "g")
                .replace("Sh", "sh")
                .replace("CH", "ch")
                .replace("sh", "sh")
                .replace("ch", "ch")
                .replace("‘", "")
                .replace("’", "")
                .replace(" ", "_");
    }


    @PostMapping
    public HttpEntity<?> addAdmin(@RequestBody UserSave userSave) {
        if (userSave.getName() == null || userSave.getPassword() == null || userSave.getPhone() == null ||
                userSave.getName().isEmpty() || userSave.getPassword().isEmpty() || userSave.getPhone().isEmpty()) {
            return ResponseEntity.badRequest().body("Name, phone or password is missing");
        }

        Role adminRole = roleRepo.findByName(UserRoles.ROLE_TEACHER);
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
        List<User> allAdminsByRole = userRepo.findAllTeachersByRole();
        System.out.println(allAdminsByRole);
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
