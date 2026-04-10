package com.example.backend.Controller;

import com.example.backend.Entity.StudentSubject;
import com.example.backend.Entity.TemporarySubject;
import com.example.backend.Entity.TestTemporarySubject;
import com.example.backend.Repository.StudentSubjectRepo;
import com.example.backend.Repository.TemporarySubjectRepo;
import com.example.backend.Repository.TestTemporarySubjectRepo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/test-temporary-subject")
@RequiredArgsConstructor
public class TemporarySubjectTestController {
    
    
    private final  TemporarySubjectRepo temporarySubjectRepo;
    private final TestTemporarySubjectRepo testTemporarySubjectRepo;
    private final StudentSubjectRepo studentSubjectRepo;

    @PostMapping("/test-form/{temporarySubjectId}")
    public ResponseEntity<?> postTestForm(
            @PathVariable UUID temporarySubjectId,
            @RequestBody String test
    ) {
        System.out.println(test);
        Optional<TemporarySubject> optional = temporarySubjectRepo.findById(temporarySubjectId);
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body("TemporarySubject topilmadi: " + temporarySubjectId);
        }
        TemporarySubject subject = optional.get();
        // 2️⃣ test matnini parse qilib saqlash
        int savedCount = parseAndSave(subject, test);

        // 3️⃣ javobni qaytarish
        Map<String, Object> result = new HashMap<>();
        result.put("temporarySubjectId", temporarySubjectId);
        result.put("savedTests", savedCount);

        return ResponseEntity.ok(result);
    }






    @GetMapping("/test/{studentSubjectId}")
    public ResponseEntity<?> getTestFormSubject(@PathVariable UUID studentSubjectId) {
        System.out.printf("getTestFormSubject studentSubjectId: %s\n", studentSubjectId);
        System.out.printf("wef");
        Optional<StudentSubject> optional = studentSubjectRepo.findById(studentSubjectId);
        System.out.printf("`%s`", optional.isPresent());
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body("StudentSubject topilmadi: " + studentSubjectId);
        }
        System.out.println("salom-----------------");
        StudentSubject subject = optional.get();
        System.out.printf("`%s`", subject);
        // 1) Java tarafida apostroflarni normallashtiramiz
        String name = normalizeApostrophes(subject.getName());

        System.out.println(name);
        System.out.printf("`%s`", name);
        // 2) DB tarafida ham normallashtiruvchi qidiruv + fallbacklar
        Optional<TemporarySubject> temporarySubject =
                temporarySubjectRepo.findBySubjectNameNormalized(name)
                        .or(() -> temporarySubjectRepo.findBySubjectNameIlike(name))
                        .or(() -> temporarySubjectRepo.findByName(name));

        System.out.println( temporarySubject);
        if (temporarySubject.isEmpty()) {
            return ResponseEntity.badRequest().body("TemporarySubject topilmadi: " + subject.getName());
        }

        List<TestTemporarySubject> tests =
                testTemporarySubjectRepo.findBySubjectId(temporarySubject.get().getId());

        return ResponseEntity.ok(pickRandomUpTo(tests, 50));
    }

    private static String normalizeApostrophes(String s) {
        if (s == null) return null;
        return s
                .replace('\u2019', '\'') // ’
                .replace('\u2018', '\'') // ‘
                .replace('\u02BC', '\'') // ʼ
                .replace('\u02BB', '\'') // ʻ
                .replace('`',        '\'')
                .trim();
    }

    private static <T> List<T> pickRandomUpTo(List<T> list, int limit) {
        if (list == null || list.isEmpty()) return Collections.emptyList();
        if (list.size() <= limit) return list;
        ArrayList<T> copy = new ArrayList<>(list);
        Collections.shuffle(copy);
        return copy.subList(0, limit);
    }




    @GetMapping("/{temporarySubjectId}")
    public ResponseEntity<?> getTestForm(@PathVariable UUID temporarySubjectId){
        // Get all, then return random 50
        List<TestTemporarySubject> tests = testTemporarySubjectRepo.findBySubjectId(temporarySubjectId);
        return ResponseEntity.ok(pickRandomUpTo(tests, 50));
    }




    @DeleteMapping("/{testTemporarySubjectId}")
    public ResponseEntity<?> deleteTestForm(@PathVariable UUID testTemporarySubjectId){
        testTemporarySubjectRepo.deleteById(testTemporarySubjectId);
        return ResponseEntity.ok().build();
    }
// ADD these imports at top of the file if missing:
// import com.fasterxml.jackson.databind.JsonNode;
// import com.fasterxml.jackson.databind.ObjectMapper;

    private int parseAndSave(TemporarySubject subject, String rawInput) {
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
                int lastBrace  = test.lastIndexOf('}');
                if (firstBrace >= 0 && lastBrace > firstBrace) {
                    String maybeJson = test.substring(firstBrace, lastBrace + 1).trim();
                    if (maybeJson.contains("\"test\"")) {
                        JsonNode root = om.readTree(maybeJson);
                        JsonNode tNode = root.get("test");
                        if (tNode != null && !tNode.isNull()) {
                            // asText() unescapes \n etc.
                            test = tNode.asText();
                            continue; // try another round (in case it's JSON again)
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
        String[] blocks = normalized.split("(?m)^\\s*\\+{5,}\\s*$");
        List<TestTemporarySubject> batch = new ArrayList<>();

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

            // Need at least 1 question + 4 answers
            if (cleaned.size() < 5) continue;

            String question = cleaned.get(0);

            // 4) Collect options and detect correct one (starts with '#')
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
            }

            // Put correct at position 0 if provided
            if (correct != null) options.add(0, correct);

            // Ensure exactly 4 options
            while (options.size() < 4) options.add("");
            if (options.size() > 4) options = options.subList(0, 4);

            // Basic validation
            if (question.isEmpty() || options.get(0).isEmpty()) continue;

            TestTemporarySubject row = TestTemporarySubject.builder()
                    .temporarySubject(subject)
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

        testTemporarySubjectRepo.saveAll(batch);
        return batch.size();
    }


//    private int parseAndSave(TemporarySubject subject, String test) {
//        if (test == null) return 0;
//
//        System.out.printf("Test: %s\n", subject);
//        // normalize line breaks
//        String normalized = test.replace("\r\n", "\n").trim();
//        if (normalized.isEmpty()) return 0;
//
//        // split by lines containing only +++++
//        String[] blocks = normalized.split("(?m)^\\s*\\+{5,}\\s*$");
//        List<TestTemporarySubject> batch = new ArrayList<>();
//
//        for (String rawBlock : blocks) {
//            String block = rawBlock.trim();
//
//            if (block.isEmpty()) continue;
//
//            // split by lines containing only ====
//            String[] parts = block.split("(?m)^\\s*=+\\s*$");
//
//            // remove empty parts
//            List<String> cleaned = new ArrayList<>();
//            for (String p : parts) {
//                String t = p.trim();
//                if (!t.isEmpty()) cleaned.add(t);
//            }
//
//            if (cleaned.size() < 5) {
//                // 1 question + 4 answers minimum
//                continue;
//            }
//
//            String question = cleaned.get(0);
//
//            // collect answers
//            List<String> options = new ArrayList<>();
//            String correct = null;
//
//            for (int i = 1; i < cleaned.size(); i++) {
//                String opt = cleaned.get(i).trim();
//                if (opt.isEmpty()) continue;
//
//                if (opt.startsWith("#")) {
//                    String dropHash = opt.substring(1).trim();
//                    if (!dropHash.isEmpty()) {
//                        correct = dropHash;
//                    }
//                } else {
//                    options.add(opt);
//                }
//            }
//
//            // insert correct answer at position 0
//            if (correct != null) {
//                options.add(0, correct);
//            }
//
//            // ensure 4 options total
//            while (options.size() < 4) options.add("");
//            if (options.size() > 4) {
//                options = options.subList(0, 4);
//            }
//
//            if (question.isEmpty() || options.get(0).isEmpty()) {
//                continue; // skip if question or correct answer is empty
//            }
//
//            TestTemporarySubject row = TestTemporarySubject.builder()
//                    .temporarySubject(subject) // ⚠️ field name is lowercase
//                    .question(question)
//                    .answer1(options.get(0)) // correct
//                    .answer2(options.get(1))
//                    .answer3(options.get(2))
//                    .answer4(options.get(3))
//                    .created(LocalDateTime.now())
//                    .build();
//
//            batch.add(row);
//        }
//
//        if (batch.isEmpty()) return 0;
//
//        testTemporarySubjectRepo.saveAll(batch);
//        return batch.size();
//    }

    
}
