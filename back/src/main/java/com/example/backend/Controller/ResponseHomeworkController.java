package com.example.backend.Controller;


import com.example.backend.DTO.ResponseHomeworkDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/response-homework")
@RequiredArgsConstructor
public class ResponseHomeworkController {
    private final ResponseHomeworkRepo responseHomeworkRepo;
    private final StudentRepo studentRepo;
    private final HomeworkRepo homeworkRepo;
    private final AttachmentRepo attachmentRepo;

    @GetMapping("/all")
    public HttpEntity<?> getAllResponseHomework(){
        List<ResponseHomework> responseHomeworks = responseHomeworkRepo.findAll();
        return ResponseEntity.ok(responseHomeworks);
    }
    @GetMapping("/{homeworkId}")
    public HttpEntity<?> getResponseHomework(@PathVariable UUID homeworkId) {
        Optional<Homework> homework = responseHomeworkRepo.findByIdHomeworkId(homeworkId);
        if(homework.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Homework homeworkOne = homework.get();
        return ResponseEntity.ok(homeworkOne);
    }
//    bu true false ligini ko'rish uchun va baho ni ham isSend and score
    @GetMapping("/one-homework/{studentId}/{homeworkId}")
    public HttpEntity<?> oneHomework(@PathVariable UUID studentId, @PathVariable UUID homeworkId) {
        Optional<ResponseHomework> response = responseHomeworkRepo.findByStudentIdAndHomeworkId(studentId, homeworkId);
        if(response.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ResponseHomework responseHomework = response.get();
        return ResponseEntity.ok(responseHomework);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> updateResponseHomework(
            @PathVariable UUID id,
            @RequestBody ResponseHomeworkDTO dto
    ) {
        try {
            // 🔹 1️⃣ Mavjud ResponseHomework ni topish
            Optional<ResponseHomework> optionalResponse = responseHomeworkRepo.findById(id);
            if (optionalResponse.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ ResponseHomework topilmadi");
            }

            ResponseHomework responseHomework = optionalResponse.get();

            // 🔹 2️⃣ Student va Homework yangilanishi (agar kiritilgan bo‘lsa)
            if (dto.getStudentId() != null) {
                Student student = studentRepo.findById(dto.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student topilmadi"));
                responseHomework.setStudent(student);
            }

            if (dto.getHomeworkId() != null) {
                Homework homework = homeworkRepo.findById(dto.getHomeworkId())
                        .orElseThrow(() -> new RuntimeException("Homework topilmadi"));
                responseHomework.setHomework(homework);
            }
            // 🔹 3️⃣ Fayl yangilanishi
            if (dto.getFileId() != null) {
                Attachment attachment = attachmentRepo.findById(dto.getFileId())
                        .orElseThrow(() -> new RuntimeException("Fayl topilmadi"));
                responseHomework.setAttachment(attachment);
            }

            // 🔹 4️⃣ Ball (ball) va Score (score) yangilanishi
            if (dto.getBall() != null) {
                responseHomework.setBall(dto.getBall());
            }

            if (dto.getScore() != null) {
                responseHomework.setScore(dto.getScore());
            }

            // 🔹 5️⃣ isSend qiymatini qayta aniqlash
            boolean isSend = true;
            if (dto.getBall() != null && dto.getBall() >= 0) {
                isSend = responseHomework.getIsSend();
            }
            responseHomework.setIsSend(isSend);

            // 🔹 7️⃣ Saqlash
            ResponseHomework saved = responseHomeworkRepo.save(responseHomework);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Update error: " + e.getMessage());
        }
    }


    @PostMapping
    public HttpEntity<?> createResponseHomework(@RequestBody ResponseHomeworkDTO dto) {
        Optional<Student> studentId = studentRepo.findById(dto.getStudentId());
        Optional<Homework> homeworkId = homeworkRepo.findById(dto.getHomeworkId());
        if (studentId.isEmpty() || homeworkId.isEmpty()) {
            return  ResponseEntity.notFound().build();
        }
        Attachment attachment = null;
        if(dto.getFileId()!=null){
            Optional<Attachment> fileId = attachmentRepo.findById(dto.getFileId());
            if(fileId.isEmpty()){
                return  ResponseEntity.notFound().build();
            }
            attachment = fileId.get();
        }
        boolean isSend = true;
        if (dto.getBall() != null && dto.getBall() >= 0) {
            isSend = false;
        }
        Integer scoreTest = 0;
        if (dto.getBall() != null && dto.getBall() >= 0) {
            scoreTest = dto.getBall();
        }
        ResponseHomework responseHomework = new ResponseHomework(homeworkId.get(), studentId.get(), attachment, LocalDateTime.now(), isSend, scoreTest);
        ResponseHomework saved;
        saved = responseHomeworkRepo.save(responseHomework);
        System.out.println(saved);
        return ResponseEntity.ok(saved);
    }
//    baholash uchun o'qituvchi baholashi uchun
@PutMapping("/{studentId}/{homeworkId}")
public HttpEntity<?> editScore(
        @PathVariable UUID studentId,
        @PathVariable UUID homeworkId,
        @RequestBody ResponseHomeworkDTO dto
) {
    Optional<ResponseHomework> optionalResponse = responseHomeworkRepo.findByStudentIdAndHomeworkId(studentId, homeworkId);

    if (optionalResponse.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("ResponseHomework topilmadi");
    }

    // Mavjud obyektni olish
    ResponseHomework responseHomework = optionalResponse.get();

    // Ballni yangilash
    Integer score = dto.getScore();
    responseHomework.setScore(score);

    // Baholanganligini belgilash (agar bunday maydon bo‘lsa)
    responseHomework.setGradedStatus(true);

    // So‘ng yangilangan obyektni saqlash
    ResponseHomework saved = responseHomeworkRepo.save(responseHomework);

    return ResponseEntity.ok(saved);
}




    @GetMapping("/check/{lessonId}")
    public HttpEntity<?> getAllResponseHomework(@PathVariable UUID lessonId) {
        // 1️⃣ Shu darsga tegishli barcha homeworklarni olish
        List<Homework> homeworks = homeworkRepo.findAllByLessonId(lessonId);

        // 2️⃣ Agar homework topilmasa
        if (homeworks.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Ushbu dars uchun homework topilmadi");
        }

        // 3️⃣ Homework IDlarini yig‘ib olish
        List<UUID> homeworkIds = homeworks.stream()
                .map(Homework::getId)
                .toList();

        // 4️⃣ Shu IDlar bo‘yicha barcha ResponseHomeworklarni olish
        List<ResponseHomework> responses = responseHomeworkRepo.findAllByHomeworkIdIn(homeworkIds);

        // 5️⃣ Natijani qaytarish
        return ResponseEntity.ok(responses);
    }


    @DeleteMapping("/{responseId}")
    public ResponseEntity<?> deleteResponseHomework(@PathVariable UUID responseId) {
        if (!responseHomeworkRepo.existsById(responseId)) {
            return ResponseEntity.notFound().build();
        }
        responseHomeworkRepo.deleteById(responseId);
        return ResponseEntity.ok("✅ Javob muvaffaqiyatli o‘chirildi!");
    }

}
