package com.example.backend.Controller;

import com.example.backend.DTO.KafolatXatiDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.KafolatXati;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.KafolatXatiRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/kafolat-xati")
public class KafolatXatiController {

    private final KafolatXatiRepo kafolatXatiRepo;
    private final StudentRepo studentRepo;
    private final AttachmentRepo attachmentRepo;

    // ------------------- GET ALL -------------------
    @GetMapping
    public HttpEntity<?> getAll() {
        return ResponseEntity.ok(kafolatXatiRepo.findAll());
    }

    @GetMapping("/status/{kafolatId}")
    public HttpEntity<?> getStatus(@PathVariable UUID kafolatId) {
        Optional<KafolatXati> byId = kafolatXatiRepo.findById(kafolatId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        byId.get().setStatus(true);
        KafolatXati save = kafolatXatiRepo.save(byId.get());
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    // ------------------- GET BY ID -------------------
    @GetMapping("/{id}")
    public HttpEntity<?> getOne(@PathVariable UUID id) {
        return kafolatXatiRepo.findById(id)
                .<HttpEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found"));
    }

    // ------------------- GET EXPIRED (date < now) -------------------
    @GetMapping("/expired")
    public HttpEntity<?> getExpired() {
        LocalDate now = LocalDate.now();
        List<KafolatXati> expired = kafolatXatiRepo.findAll()
                .stream()
                .filter(k -> k.getDate() != null && k.getDate().isBefore(now))
                .toList();

        return ResponseEntity.ok(expired);
    }

    // ------------------- POST (CREATE) -------------------
    @PostMapping
    public HttpEntity<?> create(@RequestBody KafolatXatiDTO dto) {
        Optional<Student> student = studentRepo.findById(dto.getStudentId());
        if (student.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Student not found");
        }

        KafolatXati created = kafolatXatiRepo.save(
                KafolatXati.builder()
                        .student(student.get())
                        .text1(dto.getText1())
                        .text2(dto.getText2())
                        .text3(dto.getText3())
                        .title(dto.getTitle())
                        .status(false)
                        .date(dto.getDate())
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(created);
    }

    // ------------------- PUT (UPDATE) -------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                    @RequestBody KafolatXatiDTO dto) {

        Optional<KafolatXati> optional = kafolatXatiRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Kafolat xati topilmadi");
        }

        KafolatXati entity = optional.get();
        LocalDate today = LocalDate.now();
        // 🚫 STATUS FALSE → UMUMAN TAQIQLANADI
        if (entity.getStatus() == false) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Tasdiqlanmagan kafolat xatini tahrirlash mumkin emas");
        }
        // 🚫 STATUS TRUE, LEKIN MUDDATI TUGAMAGAN
        if (entity.getDate() != null && !entity.getDate().isBefore(today)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Kafolat xati muddati tugamagan");
        }
        // ✅ FAQAT SHU YERGA KELSA — QAYTA YUKLASHGA RUXSAT
        entity.setText1(dto.getText1());
        entity.setText2(dto.getText2());
        entity.setText3(dto.getText3());
        entity.setTitle(dto.getTitle());
        entity.setDate(dto.getDate());
        // 🔁 QAYTA TEKSHIRUV UCHUN
        entity.setStatus(false);
        entity.setCreatedAt(LocalDateTime.now());
        kafolatXatiRepo.save(entity);
        return ResponseEntity.ok(entity);
    }


    // ------------------- DELETE BY ID -------------------
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable UUID id) {

        if (!kafolatXatiRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
        }

        kafolatXatiRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    // ------------------- DELETE ALL OF A STUDENT -------------------
    @DeleteMapping("/student/{studentId}")
    public HttpEntity<?> deleteByStudent(@PathVariable UUID studentId) {
        List<KafolatXati> list = kafolatXatiRepo.findAll()
                .stream()
                .filter(k -> k.getStudent().getId().equals(studentId))
                .toList();

        kafolatXatiRepo.deleteAll(list);

        return ResponseEntity.ok("All kafolat xati for student deleted");
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable UUID studentId) {

        List<KafolatXati> list =
                kafolatXatiRepo.findByStudentIdOrderByCreatedAtDesc(studentId);

        return ResponseEntity.ok(list);
    }


}
