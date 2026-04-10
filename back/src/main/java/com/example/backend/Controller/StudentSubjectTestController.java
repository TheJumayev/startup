package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.CurriculumSubjectRepo;
import com.example.backend.Repository.StudentSubjectRepo;
import com.example.backend.Repository.StudentSubjectRepo;
import com.example.backend.Repository.TestCurriculumSubjectRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/student/test-curriculum-subject")
@RequiredArgsConstructor
public class StudentSubjectTestController {
    private final StudentSubjectRepo studentSubjectRepo;
    private final TestCurriculumSubjectRepo testCurriculumSubjectRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;

    @PostMapping("/test-form/{curriculumSubjectId}")
    public ResponseEntity<?> postTestForm(
            @PathVariable UUID curriculumSubjectId,
            @RequestBody String test
    ) {
        System.out.println(test);
        Optional<CurriculumSubject> optional = curriculumSubjectRepo.findById(curriculumSubjectId);
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body("TemporarySubject topilmadi: " + curriculumSubjectId);
        }
        CurriculumSubject subject = optional.get();
        // 2️⃣ test matnini parse qilib saqlash
        int savedCount = parseAndSave(subject, test);

        // 3️⃣ javobni qaytarish
        Map<String, Object> result = new HashMap<>();
        result.put("temporarySubjectId", subject);
        result.put("savedTests", savedCount);

        return ResponseEntity.ok(result);
    }


    @GetMapping("/test/{curriculumSubjectId}")
    public ResponseEntity<?> getTestFormSubject(@PathVariable UUID curriculumSubjectId) {
        List<TestCurriculumSubject> tests = testCurriculumSubjectRepo.findByCurriculumSubjectId(curriculumSubjectId);
        return ResponseEntity.ok(pickRandomUpTo(tests, 50));
    }

    private static <T> List<T> pickRandomUpTo(List<T> list, int limit) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        if (list.size() <= limit) return list;
        ArrayList<T> copy = new ArrayList<>(list);
        Collections.shuffle(copy);
        return copy.subList(0, limit);
    }


    @GetMapping("/{studentSubjectId}")
    public ResponseEntity<?> getTestForm(@PathVariable UUID studentSubjectId) {
        // Get all, then return random 50
        List<TestCurriculumSubject> tests = testCurriculumSubjectRepo.findByCurriculumSubjectId(studentSubjectId);
        return ResponseEntity.ok(pickRandomUpTo(tests, 50));
    }


    @DeleteMapping("/{testStudentSubjectId}")
    public ResponseEntity<?> deleteTestForm(@PathVariable UUID testStudentSubjectId) {
        testCurriculumSubjectRepo.deleteById(testStudentSubjectId);
        return ResponseEntity.ok().build();
    }

    private int parseAndSave(CurriculumSubject subject, String rawInput) {
        if (rawInput == null) return 0;

        String test = rawInput;

        // 0) Try to unwrap if the body is actually a JSON that contains {"test":"..."}
        //    or even contains another nested {"test":"..."} inside a larger string.
        try {
            ObjectMapper om = new ObjectMapper();
            // Try up to 2 unwrap rounds (outer JSON, then possible inner JSON inside the "test" string)
            for (int round = 0; round < 2; round++) {
                // Find a JSON object in the current string
                int firstBrace = test.indexOf('{');
                int lastBrace = test.lastIndexOf('}');
                if (firstBrace >= 0 && lastBrace > firstBrace) {
                    String maybeJson = test.substring(firstBrace, lastBrace + 1).trim();
                    if (maybeJson.contains("\"test\"")) {
                        JsonNode root = om.readTree(maybeJson);
                        JsonNode tNode = root.get("test");
                        if (tNode != null && !tNode.isNull()) {
                            // asText() unescapes \n etc.
                            test = tNode.asText();
                            continue;
//                            s
                            // try another round (in case it's JSON again)
                        }
                    }
                }
                break; // no more unwrap possible
            }
        } catch (Exception ignore) {
            // If anything goes wrong, we just keep 'test' as-is.
        }

        // 1) Normalize line breaks
        String normalized = test.replace("\r\n", "\n").trim();
        if (normalized.isEmpty()) return 0;

        // 2) Split by blocks "+++++" (line with only + signs)
        String[] blocks = normalized.split("(?m)^\\s*\\+{4,5}\\s*$");

        List<TestCurriculumSubject> batch = new ArrayList<>();

        for (String rawBlock : blocks) {
            String block = rawBlock.trim();
            if (block.isEmpty()) continue;

            // 3) Split inside a block by lines with only "===="
            String[] parts = block.split("(?m)^\\s*=+\\s*$");

            // Clean empty parts
            List<String> cleaned = new ArrayList<>();
            for (String p : parts) {
                String t = p.trim();
                if (!t.isEmpty()) cleaned.add(t);
            }
            System.out.println(cleaned);
            // Need at least 1 question + 4 answers
            if (cleaned.size() < 5) continue;

            String question = cleaned.get(0);

            List<String> options = new ArrayList<>();
            String correct = null;

            for (int i = 1; i < cleaned.size(); i++) {
                String opt = cleaned.get(i).trim();
                if (opt.isEmpty()) continue;

                if (opt.startsWith("#")) {
                    String dropHash = opt.substring(1).trim();
                    if (!dropHash.isEmpty()) correct = dropHash;
                } else {
                    options.add(opt);
                }
                System.out.println(opt);
            }

            // Put correct at position 0 if provided
            if (correct != null) options.add(0, correct);

            // Ensure exactly 4 options
            while (options.size() < 4) options.add("");
            if (options.size() > 4) options = options.subList(0, 4);

            // Basic validation
            if (question.isEmpty() || options.get(0).isEmpty()) continue;

            TestCurriculumSubject row = TestCurriculumSubject.builder()
                    .curriculumSubject(subject)
                    .question(question)
                    .answer1(options.get(0)) // correct (or first option if no '#')
                    .answer2(options.get(1))
                    .answer3(options.get(2))
                    .answer4(options.get(3))
                    .created(LocalDateTime.now())
                    .build();

            batch.add(row);
        }

        if (batch.isEmpty()) return 0;

        testCurriculumSubjectRepo.saveAll(batch);
        return batch.size();
    }


}
