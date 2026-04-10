package com.example.backend.Controller;

import com.example.backend.DTO.MustaqilTalimDTO;
import com.example.backend.DTO.TestMustaqilDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/mustaqil-talim-create")
public class MustaqilTalimCreateController {

    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final MustaqilTalimCreateRepo mustaqilTalimCreateRepo;
    private final TestMustaqilTalimRepo testMustaqilTalimRepo;
    private final AttachmentRepo attachmentRepo;
    @PostMapping
    public ResponseEntity<?> create(@RequestBody MustaqilTalimDTO dto) {
        try {
            CurriculumSubject cs = curriculumSubjectRepo.findById(dto.getCurriculumSubjectId())
                    .orElseThrow(() -> new RuntimeException("CurriculumSubject not found"));

            Attachment attachment = attachmentRepo.findById(dto.getAttachmentId())
                    .orElseThrow(() -> new RuntimeException("Attachment not found"));

            // ===============================
            // 1️⃣ PARENT CREATE
            // ===============================
            MustaqilTalimCreate mt = MustaqilTalimCreate.builder()
                    .name(dto.getName())
                    .position(dto.getPosition())
                    .description(dto.getDescription())
                    .curriculumSubject(cs)
                    .attachment(attachment)
                    .status(dto.getStatus())
                    .isAmaliy(dto.getIsAmaliy())
                    .testActive(Boolean.FALSE.equals(dto.getIsAmaliy()) && Boolean.TRUE.equals(dto.getTestActive()))
                    .createdAt(LocalDateTime.now())
                    .build();

            mt = mustaqilTalimCreateRepo.save(mt);

            // ===============================
            // 2️⃣ TEST PARSE (FAFAQAT amaliy EMAS bo‘lsa)
            // ===============================
            if (Boolean.FALSE.equals(dto.getIsAmaliy())
                    && dto.getTest() != null
                    && !dto.getTest().isBlank()) {

                List<TestMustaqilTalim> tests = parseTests(dto.getTest());

                if (!tests.isEmpty()) {
                    tests = testMustaqilTalimRepo.saveAll(tests);
                    mt.setTestMustaqilTalim(tests);
                    mustaqilTalimCreateRepo.save(mt);
                }
            }

            return ResponseEntity.ok(mt);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Error: " + e.getMessage());
        }
    }

    @PutMapping("/{mustaqilTalimId}")
    public ResponseEntity<?> edit(
            @PathVariable UUID mustaqilTalimId,
            @RequestBody MustaqilTalimDTO dto
    ) {
        try {
            MustaqilTalimCreate mt = mustaqilTalimCreateRepo.findById(mustaqilTalimId)
                    .orElseThrow(() -> new RuntimeException("Mustaqil ta'lim topilmadi"));

            // 🔹 BASIC FIELDS
            if (dto.getName() != null && !dto.getName().isBlank()) {
                mt.setName(dto.getName());
            }

            if (dto.getPosition() != null) {
                mt.setPosition(dto.getPosition());
            }

            if (dto.getDescription() != null) {
                mt.setDescription(dto.getDescription());
            }

            if (dto.getStatus() != null) {
                mt.setStatus(dto.getStatus());
            }

            if (dto.getAttachmentId() != null) {
                Attachment attachment = attachmentRepo.findById(dto.getAttachmentId())
                        .orElseThrow(() -> new RuntimeException("Attachment not found"));
                mt.setAttachment(attachment);
            }
            if(dto.getIsAmaliy()!=null){
                mt.setIsAmaliy(dto.getIsAmaliy());
            }

            // ===============================
            // 🔥 AMALIY LOGIKA (ASOSIY QISM)
            // ===============================
            if (Boolean.TRUE.equals(dto.getIsAmaliy())) {
                // ❌ Testlar bo‘lmasin
                mt.setTestActive(false);

                if (mt.getTestMustaqilTalim() != null &&
                        !mt.getTestMustaqilTalim().isEmpty()) {

                    // DB dan testlarni o‘chiramiz
                    testMustaqilTalimRepo.deleteAll(mt.getTestMustaqilTalim());

                    // Entity ichidan ham tozalaymiz
                    mt.getTestMustaqilTalim().clear();
                }

            } else {
                // ✅ Amaliy emas → testga ruxsat
                if (dto.getTestActive() != null) {
                    mt.setTestActive(dto.getTestActive());
                }
            }

            MustaqilTalimCreate save = mustaqilTalimCreateRepo.save(mt);
            return ResponseEntity.ok(save);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Edit error: " + e.getMessage());
        }
    }

    @PutMapping("/test-edit/{testId}")
    public ResponseEntity<?> editTest(@PathVariable UUID testId, @RequestBody TestMustaqilDTO dto) {
        Optional<TestMustaqilTalim> test = testMustaqilTalimRepo.findById(testId);
        if (test.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        TestMustaqilTalim testMustaqilTalim = test.get();
        testMustaqilTalim.setQuestion(dto.getQuestion());
        testMustaqilTalim.setAnswer1(dto.getAnswer());
        testMustaqilTalim.setAnswer2(dto.getWrongAnswer1());
        testMustaqilTalim.setAnswer3(dto.getWrongAnswer2());
        testMustaqilTalim.setAnswer4(dto.getWrongAnswer3());
        TestMustaqilTalim save = testMustaqilTalimRepo.save(testMustaqilTalim);
        return ResponseEntity.ok(save);
    }

    @GetMapping("/one/{mustaqilId}")
    public ResponseEntity<?> getOne(@PathVariable UUID mustaqilId) {
        Optional<MustaqilTalimCreate> mustaqilTalimCreate = mustaqilTalimCreateRepo.findById(mustaqilId);
        if (mustaqilTalimCreate.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mustaqilTalimCreate.get());
    }



    @GetMapping("/{curriculmId}")
    public ResponseEntity<?> getMustaqilTalimId(@PathVariable UUID curriculmId) {
        List<MustaqilTalimCreate> mustaqilTalimCreates =
                mustaqilTalimCreateRepo
                        .findAllByCurriculumSubjectIdOrderByPositionAsc(curriculmId);
        if (mustaqilTalimCreates.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mustaqilTalimCreates);
    }
    private List<TestMustaqilTalim> parseTests(String rawText) {

        List<TestMustaqilTalim> result = new ArrayList<>();

        String normalized = rawText.replace("\r\n", "\n").trim();
        String[] blocks = normalized.split("(?m)^\\s*\\+{5,}\\s*$");

        for (String rawBlock : blocks) {
            String block = rawBlock.trim();
            if (block.isEmpty()) continue;

            String[] parts = block.split("(?m)^\\s*=+\\s*$");
            List<String> cleaned = new ArrayList<>();

            for (String p : parts) {
                String t = p.trim();
                if (!t.isEmpty()) cleaned.add(t);
            }

            if (cleaned.size() < 5) continue;

            String question = cleaned.get(0);
            List<String> options = new ArrayList<>();
            String correct = null;

            for (int i = 1; i < cleaned.size(); i++) {
                String opt = cleaned.get(i);
                if (opt.startsWith("#")) {
                    correct = opt.substring(1).trim();
                } else {
                    options.add(opt);
                }
            }

            if (correct == null) continue;

            options.add(0, correct);
            while (options.size() < 4) options.add("");
            if (options.size() > 4) options = options.subList(0, 4);

            result.add(TestMustaqilTalim.builder()
                    .question(question)
                    .answer1(options.get(0))
                    .answer2(options.get(1))
                    .answer3(options.get(2))
                    .answer4(options.get(3))
                    .ball(1)
                    .created(LocalDateTime.now())
                    .build());
        }

        return result;
    }

    @GetMapping("/tests/{mustaqilId}")
    public ResponseEntity<?> getTestMustaqilId(@PathVariable UUID mustaqilId) {
        MustaqilTalimCreate mt = mustaqilTalimCreateRepo.findById(mustaqilId)
                .orElseThrow(() -> new RuntimeException("Mustaqil ta'lim topilmadi"));

        // agar testActive false bo‘lsa — umuman bermaymiz
        if (Boolean.FALSE.equals(mt.getTestActive())) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(mt.getTestMustaqilTalim());
    }

    @DeleteMapping("/{mustaqilId}")
    public ResponseEntity<?> deleteOne(@PathVariable UUID mustaqilId) {
        mustaqilTalimCreateRepo.deleteById(mustaqilId);
        return ResponseEntity.ok().build();
    }


}
