package com.example.backend.Controller;

import com.example.backend.Entity.Teacher;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.TeacherRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/hemis-teacher")
public class HemisTeacherController {

    private final TeacherRepo teacherRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;

    @GetMapping("/update")
    public ResponseEntity<?> updateTeachers() {
        System.out.println("▶️ Starting teacher update from HEMIS...");

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        System.out.println("🔑 Token: " + token);

        int page = 1;
        int savedCount = 0;
        int updatedCount = 0;

        try {
            while (true) {
                System.out.println("➡️ Fetching page: " + page);

                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/employee-list",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of("page", page, "l", "uz-UZ", "type", "teacher"),
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
                    try {
                        Integer hemisId = (Integer) item.get("id");
                        String employeeIdStr = (String) item.get("employee_id_number");
                        System.out.println(employeeIdStr);
                        Long employeeIdNumber = null;
                        try {
                            employeeIdNumber = employeeIdStr != null ? Long.parseLong(employeeIdStr) : null;
                            System.out.println(employeeIdNumber);
                        } catch (NumberFormatException ignored) {}

                        // check if teacher already exists
                        Optional<Teacher> existingOpt = teacherRepo.findByEmployeeIdNumber(employeeIdNumber);
                        System.out.println(existingOpt.isPresent());
                        Teacher teacher = existingOpt.orElse(new Teacher());

                        teacher.setHemisId(hemisId);
                        teacher.setFullName((String) item.get("full_name"));
                        teacher.setShortName((String) item.get("short_name"));
                        teacher.setEmployeeIdNumber(employeeIdNumber);

                        // gender
                        Map<String, Object> genderMap = (Map<String, Object>) item.get("gender");
                        if (genderMap != null) {
                            String genderName = (String) genderMap.get("name");
                            teacher.setGender("Erkak".equalsIgnoreCase(genderName));
                        }

                        teacher.setBirthDate(item.get("birth_date") != null ?
                                ((Number) item.get("birth_date")).longValue() : null);
                        teacher.setImageFull((String) item.get("image_full"));
//                        teacher.setEmployeeIdNumber();

                        // employee status (true if ishlamoqda)
                        Map<String, Object> empStatus = (Map<String, Object>) item.get("employeeStatus");
                        if (empStatus != null) {
                            String statusName = (String) empStatus.get("name");
                            teacher.setEmployeeStatus("Ishlamoqda".equalsIgnoreCase(statusName));
                        } else {
                            teacher.setEmployeeStatus(false);
                        }

                        teacherRepo.save(teacher);

                        if (existingOpt.isPresent()) updatedCount++;
                        else savedCount++;

                    } catch (Exception e) {
                        System.err.println("⚠️ Error saving teacher: " + e.getMessage());
                    }
                }

                Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");
                int pageCount = (Integer) pagination.get("pageCount");
                if (page >= pageCount) break;
                page++;
            }

            return ResponseEntity.ok(String.format("✅ Teacher sync completed. Saved: %d, Updated: %d", savedCount, updatedCount));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("❌ Exception: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(teacherRepo.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<?> findAllStatus() {
        return ResponseEntity.ok(teacherRepo.findAllAndEmployeeStatus(true));
    }
}
