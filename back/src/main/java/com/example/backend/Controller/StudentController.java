package com.example.backend.Controller;

import com.example.backend.DTO.*;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Security.JwtServiceStudent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentRepo studentRepo;
    private final GroupsRepo groupsRepo;
    private final JwtServiceStudent jwtServiceStudent;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody StudentRegisterDTO dto) {
        // Проверка, что пароли совпадают
        if (!dto.getPassword().equals(dto.getPasswordConfirm())) {
            return ResponseEntity.badRequest().body("Пароли не совпадают");
        }

        // Проверка, что логин не существует
        if (studentRepo.findByLogin(dto.getLogin()).isPresent()) {
            return ResponseEntity.badRequest().body("Логин уже занят");
        }

        // Проверка, что fullName не пустое
        if (dto.getFullName() == null || dto.getFullName().isEmpty()) {
            return ResponseEntity.badRequest().body("Полное имя не может быть пустым");
        }

        // Создание нового студента
        Student student = Student.builder()
                .fullName(dto.getFullName())
                .login(dto.getLogin())
                .password(passwordEncoder.encode(dto.getPassword()))
                .groups(dto.getGroupsId() != null ? groupsRepo.findById(dto.getGroupsId())
                        .orElse(null) : null)
                .createAt(LocalDate.now())
                .build();

        Student saved = studentRepo.save(student);

        // Генерация токенов
        String token = jwtServiceStudent.generateJwtToken(saved);
        String refreshToken = jwtServiceStudent.generateJwtRefreshToken(saved);

        StudentLoginResponseDTO response = new StudentLoginResponseDTO(
                saved.getId(),
                saved.getFullName(),
                saved.getLogin(),
                token,
                refreshToken
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody StudentLoginDTO dto) {
        // Поиск студента по логину
        var student = studentRepo.findByLogin(dto.getLogin());

        if (student.isEmpty()) {
            return ResponseEntity.badRequest().body("Неверный логин или пароль");
        }

        Student s = student.get();

        // Проверка пароля
        if (!passwordEncoder.matches(dto.getPassword(), s.getPassword())) {
            return ResponseEntity.badRequest().body("Неверный логин или пароль");
        }

        // Генерация токенов
        String token = jwtServiceStudent.generateJwtToken(s);
        String refreshToken = jwtServiceStudent.generateJwtRefreshToken(s);

        StudentLoginResponseDTO response = new StudentLoginResponseDTO(
                s.getId(),
                s.getFullName(),
                s.getLogin(),
                token,
                refreshToken
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody StudentDTO dto) {
        // Validatsiya: login majburiy
        if (dto.getLogin() == null || dto.getLogin().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Login bo'sh bo'lishi mumkin emas");
        }

        // Validatsiya: fullName majburiy
        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("To'liq ism bo'sh bo'lishi mumkin emas");
        }

        // Login unikal ekanligini tekshirish
        if (studentRepo.findByLogin(dto.getLogin()).isPresent()) {
            return ResponseEntity.badRequest().body("Bu login allaqachon mavjud");
        }

        // Password: agar frontdan kelsa shu, kelmasa random
        String rawPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword()
                : UUID.randomUUID().toString();

        Student student = Student.builder()
                .fullName(dto.getFullName())
                .login(dto.getLogin())
                .password(passwordEncoder.encode(rawPassword))
                .groups(dto.getGroupsId() != null ? groupsRepo.findById(dto.getGroupsId())
                        .orElseThrow(() -> new RuntimeException("Group not found")) : null)
                .createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDate.now())
                .build();

        Student saved = studentRepo.save(student);
        StudentDTO result = new StudentDTO(saved.getId(), saved.getFullName(), saved.getLogin(),
                saved.getGroups() != null ? saved.getGroups().getId() : null, saved.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> update(
            @PathVariable UUID id,
            @RequestBody StudentDTO dto
    ) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        if (dto.getFullName() != null) {
            student.setFullName(dto.getFullName());
        }

        if (dto.getGroupsId() != null) {
            student.setGroups(groupsRepo.findById(dto.getGroupsId())
                    .orElseThrow(() -> new RuntimeException("Group not found")));
        }

        if (dto.getCreateAt() != null) {
            student.setCreateAt(dto.getCreateAt());
        }

        Student updated = studentRepo.save(student);
        StudentDTO result = new StudentDTO(updated.getId(), updated.getFullName(), updated.getLogin(),
                updated.getGroups() != null ? updated.getGroups().getId() : null, updated.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getById(@PathVariable UUID id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        StudentDTO result = new StudentDTO(student.getId(), student.getFullName(), student.getLogin(),
                student.getGroups() != null ? student.getGroups().getId() : null, student.getCreateAt());
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAll() {
        List<Student> students = studentRepo.findAll();
        List<StudentDTO> dtos = students.stream()
                .map(s -> new StudentDTO(s.getId(), s.getFullName(), s.getLogin(),
                        s.getGroups() != null ? s.getGroups().getId() : null, s.getCreateAt()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!studentRepo.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}



