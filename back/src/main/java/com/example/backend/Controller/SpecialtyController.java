package com.example.backend.Controller;

import com.example.backend.Entity.Department;
import com.example.backend.Entity.Specialty;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.DepartmentRepo;
import com.example.backend.Repository.SpecialtyRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/specialty")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyRepo specialtyRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;
    private final DepartmentRepo departmentRepo;



    @GetMapping
    public HttpEntity<?> getAll() {
        return new ResponseEntity<>(specialtyRepo.findAll(), HttpStatus.OK);
    }

    @GetMapping("/update")
    public HttpEntity<?> updateSpecialties() {
        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        int savedTotal = 0;
        int currentPage = 1;
        int totalPages = 1; // default to enter loop

        try {
            do {
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/specialty-list",
                        HttpMethod.GET,
                        headers,
                        Map.of("page", currentPage),
                        null
                );

                System.out.println(response.getBody());
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
                    Map<String, Object> body = (Map<String, Object>) response.getBody();
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                    Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");

                    totalPages = (Integer) pagination.get("pageCount");
                    currentPage++;

                    for (Map<String, Object> item : items) {
                        Integer hemisId = (Integer) item.get("id");
                        String name = (String) item.get("name");
                        String code = (String) item.get("code");

                        Department department = null;
                        if (item.get("department") instanceof Map<?, ?> departmentMap) {
                            Integer deptHemisId = (Integer) departmentMap.get("id");
                            String deptName = (String) departmentMap.get("name");
                            String deptCode = (String) departmentMap.get("code");

                            department = departmentRepo.findByHemisId(deptHemisId)
                                    .orElseGet(() -> departmentRepo.save(
                                            Department.builder()
                                                    .hemisId(deptHemisId)
                                                    .name(deptName)
                                                    .code(deptCode)
                                                    .build()
                                    ));
                        }

                        Optional<Specialty> existing = specialtyRepo.findByHemisId(hemisId);
                        if (existing.isEmpty()) {
                            Specialty specialty = Specialty.builder()
                                    .hemisId(hemisId)
                                    .name(name)
                                    .code(code)
                                    .department(department)
                                    .created(LocalDateTime.now())
                                    .build();
                            specialtyRepo.save(specialty);
                            savedTotal++;
                        }
                    }
                } else {
                    return ResponseEntity.status(response.getStatusCode())
                            .body("❌ Failed to fetch specialties: " + response.getBody());
                }

            } while (currentPage <= totalPages);

            return ResponseEntity.ok("✅ Specialty list fully updated. Total new records saved: " + savedTotal);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Exception occurred: " + e.getMessage());
        }
    }
}
