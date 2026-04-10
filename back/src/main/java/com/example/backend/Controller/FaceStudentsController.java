package com.example.backend.Controller;

import com.example.backend.DTO.FaceStudentsDTO;
import com.example.backend.Entity.FaceStudents;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.FaceStudentRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/face-students")
public class FaceStudentsController {
    private final FaceStudentRepo faceStudentRepo;
    private final StudentRepo studentRepo;
    @GetMapping("/all")
    public ResponseEntity<?> getAllFaceStudents() {
        return ResponseEntity.ok(faceStudentRepo.findAll());
    }

    // 🟢 POST — agar studentda hali yozuv bo‘lmasa, yangisini yaratadi
    @PostMapping("/{studentId}")
    public ResponseEntity<?> addFaceStudent(@PathVariable UUID studentId, @RequestBody FaceStudentsDTO dto) {
        try {
            Optional<Student> studentOpt = studentRepo.findById(studentId);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Bunday ID bilan student topilmadi");
            }

            // Agar shu student uchun yozuv avvaldan mavjud bo‘lsa, PUT logikasiga o‘tadi
            Optional<FaceStudents> existingOpt = faceStudentRepo.findByStudent_Id(studentId);
            FaceStudents faceStudent = existingOpt.orElse(new FaceStudents());
            faceStudent.setStudent(studentOpt.get());

            // 🔹 Faqat kelgan maydonlarni yozamiz
            if (dto.getNickname() != null) faceStudent.setNickname(dto.getNickname());
            if (dto.getPhone() != null) faceStudent.setPhone(dto.getPhone());
            if (dto.getTelegramId() != null) faceStudent.setTelegramId(dto.getTelegramId());
            if (dto.getIsActive() != null) faceStudent.setIsActive(dto.getIsActive());

            // 🔹 Vaqt maydoni
            if (existingOpt.isEmpty()) faceStudent.setCreatedAt(LocalDateTime.now());
            else faceStudent.setCreatedAt(LocalDateTime.now());

            FaceStudents saved = faceStudentRepo.save(faceStudent);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Saqlashda xatolik: " + e.getMessage());
        }
    }

    // 🟣 PUT — mavjud yozuvni yangilaydi, faqat kelgan maydonlarni o‘zgartiradi
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateFaceStudent(@PathVariable UUID studentId, @RequestBody FaceStudentsDTO dto) {
        try {
            Optional<FaceStudents> existingOpt = faceStudentRepo.findByStudent_Id(studentId);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Student uchun Face ma’lumot topilmadi");
            }

            FaceStudents faceStudent = existingOpt.get();

            // 🔹 Faqat kelgan maydonlarni yangilash
            if (dto.getNickname() != null) faceStudent.setNickname(dto.getNickname());
            if (dto.getPhone() != null) faceStudent.setPhone(dto.getPhone());
            if (dto.getTelegramId() != null) faceStudent.setTelegramId(dto.getTelegramId());
            if (dto.getIsActive() != null) faceStudent.setIsActive(dto.getIsActive());

            faceStudent.setCreatedAt(LocalDateTime.now());
            FaceStudents updated = faceStudentRepo.save(faceStudent);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Yangilashda xatolik: " + e.getMessage());
        }
    }

    // 🔵 GET — bitta student bo‘yicha ma’lumot olish
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getFaceStudent(@PathVariable UUID studentId) {
        try {
            Optional<FaceStudents> faceStudent = faceStudentRepo.findByStudent_Id(studentId);
            if (faceStudent.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Ma’lumot topilmadi");
            }
            return ResponseEntity.ok(faceStudent.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Ma’lumot olishda xatolik: " + e.getMessage());
        }
    }
}
