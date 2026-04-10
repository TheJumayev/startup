package com.example.backend.Controller;

import com.example.backend.DTO.StudentCompleteMustaqilTalimDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/complete-mustaqil")
public class StudentCompleteMustaqilTalimController {

    private final StudentCompleteMustaqilTalimRepo repo;
    private final MustaqilTalimCreateRepo mustaqilRepo;
    private final StudentRepo studentRepo;





    // ▶ START — har doim YANGI attempt
    @PostMapping
    public ResponseEntity<?> start(@RequestBody StudentCompleteMustaqilTalimDTO dto) {
        Student student = studentRepo.findById(dto.getStudentId()).orElseThrow();
        MustaqilTalimCreate mustaqil = mustaqilRepo.findById(dto.getCreateMustaqilTalimId()).orElseThrow();

        // 🔒 eski ACTIVE ni yopamiz
        repo.findByStudent_IdAndMustaqilTalimCreate_IdAndActiveTrue(
                dto.getStudentId(), dto.getCreateMustaqilTalimId()
        ).ifPresent(old -> {
            old.setActive(false);
            repo.save(old);
        });

        // 🔢 attempt++
        int attempt = repo.findMaxAttempt(dto.getStudentId(), dto.getCreateMustaqilTalimId())
                .orElse(0) + 1;

        StudentCompleteMustaqilTalim entity = StudentCompleteMustaqilTalim.builder()
                .student(student)
                .mustaqilTalimCreate(mustaqil)
                .pageCount(dto.getPageCount())
                .pageCounter(1)
                .attempt(attempt)
                .active(true)
                .completed(false)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now())
                .createTime(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(repo.save(entity));
    }

    // ▶ UPDATE — faqat oldinga
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                    @RequestBody StudentCompleteMustaqilTalimDTO dto) {

        StudentCompleteMustaqilTalim entity = repo.findById(id).orElseThrow();

        entity.setEndTime(LocalDateTime.now());

        // ▶ faqat oldinga
        if (dto.getPageCounter() != null &&
                dto.getPageCounter() > entity.getPageCounter()) {

            entity.setPageCounter(dto.getPageCounter());
        }

        if (dto.getPageCount() != null) {
            entity.setPageCount(dto.getPageCount());
        }

        // 🔥 TUGALLANGANDA (MUHIM JOY)
        if (entity.getPageCount() != null &&
                entity.getPageCounter() >= entity.getPageCount()) {

            entity.setCompleted(true);
            entity.setActive(false);

            MustaqilTalimCreate current = entity.getMustaqilTalimCreate();

            int nextPosition = current.getPosition() + 1;


            Optional<MustaqilTalimCreate> mustaqilTalimCreate = mustaqilRepo.findByPosition(nextPosition);
            mustaqilTalimCreate.ifPresent(next -> {
                        if (!Boolean.TRUE.equals(next.getStatus())) {
                            System.out.println("bhdbsfhdbshfds");
                            next.setStatus(true);
                            mustaqilRepo.save(next);
                        }
                    });

        }

        return ResponseEntity.ok(repo.save(entity));
    }

    // ▶ FAOL SESSION
    @GetMapping("/{studentId}/{lessonId}")
    public ResponseEntity<?> getActive(@PathVariable UUID studentId,
                                       @PathVariable UUID lessonId) {
        return repo.findByStudent_IdAndMustaqilTalimCreate_IdAndActiveTrue(studentId, lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/is-completed/{studentId}/{lessonId}")
    public ResponseEntity<?> getActiveIsComplete(@PathVariable UUID studentId, @PathVariable UUID lessonId) {
        List<StudentCompleteMustaqilTalim> list = repo.findByCompletedAndStudentIdAndLessonId(studentId, lessonId);

        return ResponseEntity.ok(list);
    }



    // ▶ FINISH — YAKUNLASH (frontend Yakunlash button)
    @PutMapping("/finish/{activeId}")
    public ResponseEntity<?> finish(@PathVariable UUID activeId) {

        StudentCompleteMustaqilTalim entity =
                repo.findById(activeId).orElseThrow();

        // Agar allaqachon tugallangan bo‘lsa — qayta ishlamaymiz
        if (Boolean.TRUE.equals(entity.getCompleted())) {
            return ResponseEntity.ok(entity);
        }

        // ▶ FINALIZE
        entity.setCompleted(true);
        entity.setActive(false);
        entity.setEndTime(LocalDateTime.now());

        repo.save(entity);
        // ▶ KEYINGI MAVZUNI OCHISH
        MustaqilTalimCreate current = entity.getMustaqilTalimCreate();
        int nextPosition = current.getPosition() + 1;

        mustaqilRepo.findByPosition(nextPosition)
                .ifPresent(next -> {
                    if (!Boolean.TRUE.equals(next.getStatus())) {
                        next.setStatus(true);
                        mustaqilRepo.save(next);
                    }
                });

        return ResponseEntity.ok(repo.save(entity));
    }




}




