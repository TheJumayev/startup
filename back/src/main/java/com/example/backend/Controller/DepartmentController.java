package com.example.backend.Controller;

import com.example.backend.Entity.Department;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.DepartmentRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepo departmentRepo;

    private final ExternalApiService externalApiService;
    private final TokenHemisRepo tokenHemisRepo;

    @GetMapping("/update")
    public HttpEntity<?> updateDepartment() {
        System.out.println("▶️ Starting department update...");

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        System.out.println("🔑 Token: " + token);

        int page = 1;
        int savedCount = 0;

        try {
            do {
                System.out.println("➡️ Requesting page: " + page);
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/department-list",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of("page", page, "l", "uz-UZ"),
                        null
                );

                if (!response.getStatusCode().is2xxSuccessful() || !(response.getBody() instanceof Map)) {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body("❌ Error fetching page " + page + ": " + response.getBody());
                }

                Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
                if (!(Boolean.TRUE.equals(responseBody.get("success")))) {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body("❌ API returned failure: " + responseBody.get("error"));
                }

                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                if (data == null || !data.containsKey("items")) break;

                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                for (Map<String, Object> item : items) {
                    Integer hemisId = (Integer) item.get("id");
                    String name = (String) item.get("name");
                    String code = (String) item.get("code");

                    Map<String, Object> structureType = (Map<String, Object>) item.get("structureType");
                    String structureTypeName = (String) structureType.get("name");

                    Map<String, Object> localityType = (Map<String, Object>) item.get("localityType");
                    String localityTypeName = (String) localityType.get("name");

                    Integer parent = (Integer) item.get("parent");
                    Boolean active = (Boolean) item.get("active");

                    Department department = Department.builder()
                            .hemisId(hemisId)
                            .name(name)
                            .code(code)
                            .structureType(structureTypeName)
                            .localityType(localityTypeName)
                            .parent(parent)
                            .active(active)
                            .created(java.time.LocalDateTime.now())
                            .build();

                    try {
                        departmentRepo.save(department);

                    }catch (Exception e){
                        System.out.printf("department save error: %s\n", e.getMessage());
                    }
                    savedCount++;
                }

                int pageCount = (Integer) ((Map<String, Object>) data.get("pagination")).get("pageCount");
                if (page >= pageCount) break;
                page++;

            } while (true);

            return ResponseEntity.ok("✅ Department update completed. Total saved: " + savedCount);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Exception: " + e.getMessage());
        }
    }

    @GetMapping
    public HttpEntity<?> findAll() {
        List<Department> all = departmentRepo.findAll();
        return ResponseEntity.ok(all);
    }

}
