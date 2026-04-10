package com.example.backend.Controller;

import com.example.backend.Entity.Curriculum;
import com.example.backend.Entity.Specialty;
import com.example.backend.Entity.TeacherCurriculumSubject;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.CurriculumRepo;
import com.example.backend.Repository.SpecialtyRepo;
import com.example.backend.Repository.TeacherCurriculumSubjectRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/curriculum")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumRepo curriculumRepo;
    private final SpecialtyRepo specialtyRepo;
    private final ExternalApiService externalApiService;
    private final TokenHemisRepo tokenHemisRepo;
    private final TeacherCurriculumSubjectRepo teacherCurriculumSubjectRepo;

    @GetMapping
    public HttpEntity<?> getCurriculum(){
        List<Curriculum> all = curriculumRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @GetMapping("/{groupId}")
    public HttpEntity<?> getCurriculumByGroupId(@PathVariable UUID groupId){
        List<TeacherCurriculumSubject> all = teacherCurriculumSubjectRepo.findByGroupId(groupId);
        if(all.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(all, HttpStatus.OK);

    }

    @GetMapping("/update")
    public HttpEntity<?> updateCurriculum() {

        System.out.println("▶️ Starting department update...");

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        System.out.println("🔑 Token: " + token);


int page = 1;
        int totalPages = 1;
        int savedCount = 0;

        try {
            do {
                // Send request via ExternalApiService
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/curriculum-list",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of("page", page, "l", "uz-UZ"),
                        null
                );

                System.out.println(response.getBody());
                if (!(response.getBody() instanceof Map<?, ?> bodyMap)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Unexpected response format");
                }

                // Extract data
                Map<String, Object> data = (Map<String, Object>) bodyMap.get("data");
                if (data == null) break;

                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");
                if (pagination == null || items == null) break;

                totalPages = (int) pagination.get("pageCount");

                for (Map<String, Object> item : items) {
                    Integer hemisId = (Integer) item.get("id");
                    if (curriculumRepo.findByHemisId(hemisId).isPresent()) continue;

                    Map<String, Object> specialtyMap = (Map<String, Object>) item.get("specialty");
                    if (specialtyMap == null) continue;

                    Integer specialtyHemisId = (Integer) specialtyMap.get("id");
                    Optional<Specialty> optionalSpecialty = specialtyRepo.findByHemisId(specialtyHemisId);
                    if (optionalSpecialty.isEmpty()) continue;

                    Specialty specialty = optionalSpecialty.get();

                    Map<String, Object> educationYear = (Map<String, Object>) item.get("educationYear");
                    Map<String, Object> educationType = (Map<String, Object>) item.get("educationType");

                    Curriculum c = Curriculum.builder()
                            .hemisId(hemisId)
                            .specialty(specialty)
                            .educationYearCode(Integer.parseInt(educationYear.get("code").toString()))
                            .educationYearName(educationYear.get("name").toString())
                            .educationTypeName(educationType.get("name").toString())
                            .education_period((Integer) item.get("education_period"))
                            .semester_count((Integer) item.get("semester_count"))
                            .created(LocalDateTime.now())
                            .build();

                    curriculumRepo.save(c);
                    savedCount++;
                }

                page++;

            } while (page <= totalPages);

            return ResponseEntity.ok("✅ Curriculum updated. Total saved: " + savedCount);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error occurred: " + e.getMessage());
        }
    }
}
