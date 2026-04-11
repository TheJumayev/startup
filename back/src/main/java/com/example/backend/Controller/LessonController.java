package com.example.backend.Controller;

import com.example.backend.DTO.AttachmentDTO;
import com.example.backend.DTO.LessonDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Curriculm;
import com.example.backend.Entity.Lesson;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.CurriculmRepo;
import com.example.backend.Repository.LessonRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/lessons")
public class LessonController {

    private final LessonRepo lessonRepo;
    private final CurriculmRepo curriculmRepo;
    private final AttachmentRepo attachmentRepo;

    // CREATE (JSON)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody LessonDTO dto) {
        try {
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson nomi bo'sh bo'lishi mumkin emas"));
            }

            List<Attachment> attachments = (dto.getAttachments() != null && !dto.getAttachments().isEmpty())
                    ? attachmentRepo.findAllById(
                    dto.getAttachments().stream().map(AttachmentDTO::getId).toList()
            )
                    : List.of();

            Curriculm curriculm = null;
            if (dto.getCurriculmId() != null) {
                curriculm = curriculmRepo.findById(dto.getCurriculmId()).orElse(null);
                if (curriculm == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", true,
                            "message", "Curriculm topilmadi: " + dto.getCurriculmId()
                    ));
                }
            }

            Lesson lesson = Lesson.builder()
                    .name(dto.getName())
                    .curriculm(curriculm)
                    .attachment(attachments)
                    .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now())
                    .build();

            Lesson saved = lessonRepo.save(lesson);
            return ResponseEntity.ok(toDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // CREATE (fayl bilan birga — multipart)
    @PostMapping("/with-files")
    public ResponseEntity<?> createWithFiles(
            @RequestParam String name,
            @RequestParam(required = false) UUID curriculmId,
            @RequestParam(required = false) List<MultipartFile> files
    ) {
        try {
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson nomi bo'sh bo'lishi mumkin emas"));
            }

            Curriculm curriculm = null;
            if (curriculmId != null) {
                curriculm = curriculmRepo.findById(curriculmId).orElse(null);
                if (curriculm == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", true,
                            "message", "Curriculm topilmadi: " + curriculmId
                    ));
                }
            }

            // Fayllarni saqlash
            List<Attachment> attachments = new ArrayList<>();
            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    Attachment attachment = Attachment.createAttachment(file, "/lessons");
                    if (attachment != null) {
                        attachmentRepo.save(attachment);
                        attachments.add(attachment);
                    }
                }
            }

            Lesson lesson = Lesson.builder()
                    .name(name)
                    .curriculm(curriculm)
                    .attachment(attachments)
                    .createdAt(LocalDateTime.now())
                    .build();

            Lesson saved = lessonRepo.save(lesson);
            return ResponseEntity.ok(toDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<LessonDTO>> getAll() {
        List<LessonDTO> list = lessonRepo.findAll().stream().map(this::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        Lesson lesson = lessonRepo.findById(id).orElse(null);
        if (lesson == null) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson topilmadi"));
        }
        return ResponseEntity.ok(toDTO(lesson));
    }

    // GET BY CURRICULM ID
    @GetMapping("/curriculm/{curriculmId}")
    public ResponseEntity<List<LessonDTO>> getByCurriculmId(@PathVariable UUID curriculmId) {
        List<LessonDTO> list = lessonRepo.findByCurriculmId(curriculmId).stream().map(this::toDTO).toList();
        return ResponseEntity.ok(list);
    }

    // UPDATE (JSON)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody LessonDTO dto) {
        try {
            Lesson lesson = lessonRepo.findById(id).orElse(null);
            if (lesson == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson topilmadi"));
            }

            if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                lesson.setName(dto.getName());
            }
            if (dto.getCurriculmId() != null) {
                Curriculm curriculm = curriculmRepo.findById(dto.getCurriculmId()).orElse(null);
                if (curriculm == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", true,
                            "message", "Curriculm topilmadi: " + dto.getCurriculmId()
                    ));
                }
                lesson.setCurriculm(curriculm);
            }
            if (dto.getAttachments() != null) {
                lesson.setAttachment(
                        attachmentRepo.findAllById(
                                dto.getAttachments().stream().map(AttachmentDTO::getId).toList()
                        )
                );
            }
            if (dto.getCreatedAt() != null) {
                lesson.setCreatedAt(dto.getCreatedAt());
            }

            Lesson updated = lessonRepo.save(lesson);
            return ResponseEntity.ok(toDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // UPDATE (fayl bilan birga — multipart)
    @PutMapping("/with-files/{id}")
    public ResponseEntity<?> updateWithFiles(
            @PathVariable UUID id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) UUID curriculmId,
            @RequestParam(required = false) List<MultipartFile> files
    ) {
        try {
            Lesson lesson = lessonRepo.findById(id).orElse(null);
            if (lesson == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson topilmadi"));
            }

            if (name != null && !name.trim().isEmpty()) {
                lesson.setName(name);
            }
            if (curriculmId != null) {
                Curriculm curriculm = curriculmRepo.findById(curriculmId).orElse(null);
                if (curriculm == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", true,
                            "message", "Curriculm topilmadi: " + curriculmId
                    ));
                }
                lesson.setCurriculm(curriculm);
            }

            // Yangi fayllarni saqlash va mavjudlariga qo'shish
            if (files != null && !files.isEmpty()) {
                List<Attachment> existingAttachments = lesson.getAttachment() != null
                        ? new ArrayList<>(lesson.getAttachment()) : new ArrayList<>();
                for (MultipartFile file : files) {
                    Attachment attachment = Attachment.createAttachment(file, "/lessons");
                    if (attachment != null) {
                        attachmentRepo.save(attachment);
                        existingAttachments.add(attachment);
                    }
                }
                lesson.setAttachment(existingAttachments);
            }

            Lesson updated = lessonRepo.save(lesson);
            return ResponseEntity.ok(toDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // REMOVE ATTACHMENT from Lesson (faylni lessondan olib tashlash + diskdan o'chirish)
    @DeleteMapping("/{lessonId}/attachments/{attachmentId}")
    public ResponseEntity<?> removeAttachment(
            @PathVariable UUID lessonId,
            @PathVariable UUID attachmentId
    ) {
        try {
            Lesson lesson = lessonRepo.findById(lessonId).orElse(null);
            if (lesson == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson topilmadi"));
            }

            Attachment attachment = attachmentRepo.findById(attachmentId).orElse(null);
            if (attachment == null) {
                return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Attachment topilmadi"));
            }

            // Lessondan attachmentni olib tashlash
            if (lesson.getAttachment() != null) {
                lesson.getAttachment().removeIf(a -> a.getId().equals(attachmentId));
                lessonRepo.save(lesson);
            }

            // Diskdan faylni o'chirish
            String filePath = "backend/files" + attachment.getPrefix() + "/" + attachment.getName();
            java.io.File file = new java.io.File(filePath);
            if (file.exists()) {
                file.delete();
            }

            // Bazadan attachmentni o'chirish
            attachmentRepo.delete(attachment);

            return ResponseEntity.ok(Map.of(
                    "error", false,
                    "message", "Fayl o'chirildi",
                    "lesson", toDTO(lessonRepo.findById(lessonId).orElse(lesson))
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        if (!lessonRepo.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", true, "message", "Lesson topilmadi"));
        }
        lessonRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("error", false, "message", "Lesson o'chirildi"));
    }

    private LessonDTO toDTO(Lesson lesson) {
        return new LessonDTO(
                lesson.getId(),
                lesson.getName(),
                lesson.getCurriculm() != null ? lesson.getCurriculm().getId() : null,
                lesson.getAttachment() != null
                        ? lesson.getAttachment()
                        .stream()
                        .map(att -> new AttachmentDTO(att.getId(), att.getName())) // 🔥 ASOSIY O'ZGARISH
                        .toList()
                        : List.of(),
                lesson.getCreatedAt()
        );
    }
}

