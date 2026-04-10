package com.example.backend.Controller;

import com.example.backend.DTO.LessonFileCreateDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.LessonFile;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.LessonFIleRepo;
import com.example.backend.Repository.LessonRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/lessons-file")
public class   LessonFileController {

    private final LessonFIleRepo lessonFileRepo;
    private final LessonRepo lessonRepo;
    private final AttachmentRepo attachmentRepo;

    /* -------------------- Attachments -------------------- */

    // Upload a file and create Attachment (returns saved Attachment)
    @PostMapping("/attachments/upload")
    public HttpEntity<?> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "/lesson") String prefix
    ) {
        try {
            Attachment attachment = Attachment.createAttachment(file, prefix);
            if (attachment == null) {
                return ResponseEntity.badRequest().body("❌ File is empty.");
            }
            attachmentRepo.save(attachment);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Upload error: " + e.getMessage());
        }
    }

    // Optional: fetch attachment meta
    @GetMapping("/attachments/{id}")
    public HttpEntity<?> getAttachment(@PathVariable UUID id) {
        return attachmentRepo.findById(id)
                .<HttpEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Attachment not found"));
    }

    /* -------------------- Lesson Files (links) -------------------- */

    // Create a LessonFile by linking existing attachmentId to lessonId
    @PostMapping
    public HttpEntity<?> createLessonFile(@RequestBody LessonFileCreateDTO dto) {
        try {
            if (dto.getLessonId() == null) {
                return ResponseEntity.badRequest().body("❌ lessonId and attachmentId are required.");
            }

            Optional<Lesson> optLesson = lessonRepo.findById(dto.getLessonId());
            if (optLesson.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Lesson not found.");
            }
            Attachment attachment = null;
            if (dto.getAttachmentId() != null) {
                Optional<Attachment> optAttachment = attachmentRepo.findById(dto.getAttachmentId());

                if (optAttachment.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Attachment not found.");
                }
                attachment = optAttachment.get();
            }

            LessonFile lf = LessonFile.builder()
                    .lesson(optLesson.get())
                    .attachment(attachment)
                    .created(LocalDateTime.now())
                    .videoUrl(dto.getVideo())
                    .build();
            lf = lessonFileRepo.save(lf);
            return ResponseEntity.status(HttpStatus.CREATED).body(lf);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Create error: " + e.getMessage());
        }
    }

    // Get all LessonFiles (paginated)
    @GetMapping
    public HttpEntity<?> getAllLessonFiles(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        Page<LessonFile> p = lessonFileRepo.findAll(PageRequest.of(page, size));
        Map<String, Object> payload = Map.of(
                "content", p.getContent(),
                "page", p.getNumber(),
                "size", p.getSize(),
                "totalElements", p.getTotalElements(),
                "totalPages", p.getTotalPages()
        );
        return ResponseEntity.ok(payload);
    }

    // Get files by Lesson ID (ordered by created desc)
    @GetMapping("/by-lesson/{lessonId}")
    public HttpEntity<?> getByLesson(@PathVariable UUID lessonId) {
        try {
            List<LessonFile> list = lessonFileRepo.findAllByLessonIdOrderByCreatedDesc(lessonId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Fetch error: " + e.getMessage());
        }
    }

    // Get single LessonFile
    @GetMapping("/{id}")
    public HttpEntity<?> getOne(@PathVariable UUID id) {
        return lessonFileRepo.findById(id)
                .<HttpEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ LessonFile not found"));
    }

    // Delete LessonFile
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable UUID id) {
        if (!lessonFileRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ LessonFile not found");
        }
        lessonFileRepo.deleteById(id);
        return ResponseEntity.ok("✅ Deleted");
    }
}
