package com.example.backend.Controller;

import com.example.backend.Entity.Subject;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.SubjectRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import jakarta.persistence.Column;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepo subjectRepo;
    private final ExternalApiService externalApiService;
    private final TokenHemisRepo tokenHemisRepo;

    @GetMapping("/update")
    public ResponseEntity<?> updateSubjectFromExternal() {
        System.out.println("\u25B6\uFE0F Starting subject update...");

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("\u274C Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        System.out.println("\ud83d\udd11 Token: " + token);

        int page = 1;
        int totalCount = 0;
        int savedCount = 0;

        try {
            do {
                System.out.println("\u2794 Requesting page: " + page);
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/subject-meta-list",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of("page", page, "l", "uz-UZ"),
                        null
                );

                if (!response.getStatusCode().is2xxSuccessful() || !(response.getBody() instanceof Map)) {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body("\u274C Error fetching page " + page + ": " + response.getBody());
                }

                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                if (!(Boolean.TRUE.equals(responseBody.get("success")))) {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body("\u274C API returned failure: " + responseBody.get("error"));
                }

                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                if (data == null || !data.containsKey("items")) break;

                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                for (Map<String, Object> item : items) {
                    Integer hemisId = (Integer) item.get("id");
                    if (subjectRepo.findByHemisId(hemisId).isPresent()) continue;

                    Subject subject = Subject.builder()
                            .hemisId(hemisId)
                            .code((String) item.get("code"))
                            .name((String) item.get("name"))
                            .active((Boolean) item.get("active"))
                            .subjectGroupCode(extractNestedString(item, "subjectGroup", "code"))
                            .subjectGroupName(extractNestedString(item, "subjectGroup", "name"))
                            .educationTypeCode(extractNestedString(item, "educationType", "code"))
                            .educationTypeName(extractNestedString(item, "educationType", "name"))
                            .created(LocalDateTime.now())
                            .build();


                    try {
                        subjectRepo.save(subject);

                    }catch (Exception e){
                        System.out.printf("subject save error: %s\n", e.getMessage());
                    }

                    savedCount++;
                }

                // Get pagination
                Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");
                if (pagination != null) {
                    totalCount = (Integer) pagination.get("totalCount");
                    int pageCount = (Integer) pagination.get("pageCount");
                    if (page >= pageCount) break;
                } else {
                    break;
                }

                page++;
            } while (true);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("\u274C Exception: " + e.getMessage());
        }

        return ResponseEntity.ok("\u2705 Subjects sync complete. Total saved: " + savedCount);
    }

    private String extractNestedString(Map<String, Object> parent, String field, String subfield) {
        if (parent.containsKey(field) && parent.get(field) instanceof Map) {
            Map<String, Object> nested = (Map<String, Object>) parent.get(field);
            Object value = nested.get(subfield);
            return value != null ? value.toString() : null;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getAllSubjects() {
        List<Subject> all = subjectRepo.findAll();
        return ResponseEntity.ok(all);
    }
}
