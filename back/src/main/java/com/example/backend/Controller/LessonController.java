package com.example.backend.Controller;


import com.example.backend.Entity.CurriculumSubject;
import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.CurriculumSubjectRepo;
import com.example.backend.Repository.LessonRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/lessons")
public class LessonController {
    private final LessonRepo lessonRepo;
    private final CurriculumSubjectRepo curriculumRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;

    @GetMapping("/update/{curriculumSubjectId}")
    public ResponseEntity<?> updateLessonsByCurriculumSubject(@PathVariable UUID curriculumSubjectId) {
        // 1) Find CurriculumSubject
        Optional<CurriculumSubject> csOpt = curriculumRepo.findById(curriculumSubjectId);
        if (csOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ CurriculumSubject not found: " + curriculumSubjectId);
        }
        CurriculumSubject cs = csOpt.get();
        if (cs.getSubject() == null || cs.getSubject().getHemisId() == null ||
                cs.getCurriculum() == null || cs.getCurriculum().getHemisId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ CurriculumSubject is missing subject/curriculum hemisId.");
        }
        Integer subjHemisId = cs.getSubject().getHemisId();
        Integer curHemisId  = cs.getCurriculum().getHemisId();

        // 2) Token
        List<TokenHemis> tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = tokens.get(tokens.size() - 1).getName();

        // 3) Pagination
        int page = 1, totalPages = 1, upserted = 0;

        try {
            do {
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/curriculum-subject-topic-list",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of(
                                "page", page,
                                "limit", 200,          // max page size
                                "_subject", subjHemisId,
                                "_curriculum", curHemisId
                        ),
                        null
                );

                System.out.printf("response: %s\n", response);
                if (!(response.getBody() instanceof Map<?, ?> bodyMap)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("❌ Unexpected response body at page " + page);
                }

                Map<String, Object> data = (Map<String, Object>) bodyMap.get("data");
                if (data == null) break;

                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");
                if (pagination != null) {
                    Object pc = pagination.get("pageCount");
                    if (pc instanceof Number n) totalPages = n.intValue();
                }

                if (items != null) {
                    for (Map<String, Object> it : items) {
                        Integer hemisId   = asInt(it.get("id"));
                        String  name      = asString(it.get("name"));          // topic name
                        Integer topicLoad = asInt(it.get("topic_load"));       // academic load per topic
                        Integer position  = asInt(it.get("position"));
                        Boolean active    = asBool(it.get("active"));
                        Integer dept      = asNestedInt(it, "department", "id");// some APIs return object
                        Integer semester  = asInt(it.get("_semester"));// or maybe "id"
                        Integer trainType = asInt(it.get("_training_type")); // or "id"
                        Long createdAt    = asLong(it.get("created_at"));
                        Long updatedAt    = asLong(it.get("updated_at"));
                        Boolean isMy      = asBool(it.get("is_my"));

                        // Upsert by hemisId
                        Lesson lesson = lessonRepo.findByHemisIdAndCurriculumSubjectId(hemisId, curriculumSubjectId).orElseGet(() ->
                                Lesson.builder().hemisId(hemisId).curriculumSubject(cs).created(LocalDateTime.now()).build()
                        );

                        lesson.setName(name);
                        lesson.setTopic_load(topicLoad);
                        lesson.setPosition(position);
                        lesson.setActive(active);
                        lesson.setDepartment(dept);
                        lesson.setSemester(semester);
                        lesson.setTrainingType(trainType);
                        lesson.setCreatedAt(createdAt);
                        lesson.setUpdatedAt(updatedAt);
                        lesson.setIsMy(isMy);
                        lesson.setCurriculumSubject(cs); // ensure link

                        lessonRepo.save(lesson);
                        upserted++;
                    }
                }

                page++;
            } while (page <= totalPages);

            return ResponseEntity.ok(Map.of(
                    "message", "✅ Lessons updated",
                    "curriculumSubjectId", curriculumSubjectId,
                    "subjectHemisId", subjHemisId,
                    "curriculumHemisId", curHemisId,
                    "pages", totalPages,
                    "upserted", upserted
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error: " + e.getMessage());
        }
    }


    @GetMapping("/by-curriculum-subject/{curriculumSubjectId}")
    public ResponseEntity<?> getLessonsByCurriculumSubject(@PathVariable UUID curriculumSubjectId) {
        if (!curriculumRepo.existsById(curriculumSubjectId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ CurriculumSubject not found: " + curriculumSubjectId);
        }
        return ResponseEntity.ok(lessonRepo.findAllByCurriculumSubjectIdOrderByPositionAsc(curriculumSubjectId));
    }

    // ---------- Helpers ----------
    private static String asString(Object v) { return v == null ? null : String.valueOf(v); }
    private static Integer asInt(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.intValue();
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : Integer.parseInt(s);
    }
    private static Long asLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : Long.parseLong(s);
    }
    private static Boolean asBool(Object v) {
        if (v == null) return null;
        if (v instanceof Boolean b) return b;
        String s = String.valueOf(v).trim().toLowerCase();
        if (s.isEmpty()) return null;
        return s.equals("1") || s.equals("true") || s.equals("yes");
    }
    @SuppressWarnings("unchecked")
    private static Integer asNestedInt(Map<String, Object> map, String key, String innerKey) {
        if (map == null) return null;
        Object inner = map.get(key);
        if (!(inner instanceof Map<?, ?> m)) return null;
        Object v = m.get(innerKey);
        return asInt(v);
    }
}

//6b8ad6a7-0a2e-40a8-bd54-5df50ea634ba