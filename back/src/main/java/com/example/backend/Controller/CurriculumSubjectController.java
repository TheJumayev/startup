package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/curriculum-subject")
@RequiredArgsConstructor
public class
    CurriculumSubjectController {
    private final SubjectDetailsRepo subjectDetailsRepo;
    private final SubjectRepo subjectRepo;
    private final SubjectExamTypesRepo subjectExamTypesRepo;
    private final DepartmentRepo departmentRepo;
    private final CurriculumRepo curriculumRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;

    private final TestCurriculumSubjectRepo testCurriculumSubjectRepo;

    //fan
    @GetMapping("/student/{studentId}")
    public HttpEntity<?> getCurriculumSubject(@PathVariable UUID studentId) {
        List<CurriculumSubject> byId = curriculumSubjectRepo.findByStudentId(studentId);
        return new ResponseEntity<>(byId, HttpStatus.OK);
    }


    @GetMapping("/filter")
    public ResponseEntity<?> filterCurriculumSubjects(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID curriculumId,
            @RequestParam(required = false, defaultValue = "0") Integer curriculumHemisId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            var pageable = PageRequest.of(page, size);

            // 🔹 Resolve curriculumId from hemisId if provided
            if (curriculumHemisId != 0) {
                var curriculumOpt = curriculumRepo.findByHemisId(curriculumHemisId);
                if (curriculumOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("message", "Curriculum not found for hemisId: " + curriculumHemisId));
                }
                curriculumId = curriculumOpt.get().getId();
            }

            // 🔹 Query results
            var resultPage = curriculumSubjectRepo.filterNative(subjectId, departmentId, curriculumId, pageable);

            // 🔹 Add test count to each subject
            var enrichedContent = resultPage.getContent().stream()
                    .map(subject -> {
                        Integer testCount = testCurriculumSubjectRepo
                                .findTestCountTestByCurriculumSubjectId(subject.getId());
                        return Map.of(
                                "subject", subject,
                                "test_count", testCount != null ? testCount : 0
                        );
                    })
                    .toList();

            // 🔹 Prepare response payload
            var payload = Map.of(
                    "content", enrichedContent,
                    "page", resultPage.getNumber(),
                    "size", resultPage.getSize(),
                    "totalElements", resultPage.getTotalElements(),
                    "totalPages", resultPage.getTotalPages()
            );

//            System.out.printf("✅ Curriculum subject filter result: %s%n", payload);
            return ResponseEntity.ok(payload);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/update")
    public ResponseEntity<?> updateCurriculumSubjectAndSave() {
        System.out.println("\u25B6\uFE0F Starting curriculum subject update...");

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("\u274C Token not found");
        }

        String token = all.get(all.size() - 1).getName();
        int page = 1, savedCount = 0, totalPages = 1;
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        System.out.printf("Token: %s\n", token);
        try {
            do {
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/curriculum-subject-list",
                        HttpMethod.GET,
                        headers,
                        Map.of("page", page),
                        null
                );

                System.out.printf("Response: %s\n", response);
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                Map<String, Object> pagination = (Map<String, Object>) data.get("pagination");
                totalPages = (Integer) pagination.get("pageCount");
                page++;
                System.out.println("1");
                for (Map<String, Object> item : items) {
                    Integer hemisId = (Integer) item.get("id");
                    Map<String, Object> semester = (Map<String, Object>) item.get("semester");

                    String semesterCode =null;
                    String semesterName=null;
                    if (semester != null) {
                         semesterCode = (String) semester.get("code");
                         semesterName = (String) semester.get("name");
                    }
                    Optional<CurriculumSubject> byHemisId = curriculumSubjectRepo.findByHemisId(hemisId);
                    // SubjectDetails
                    System.out.println("4");

                    List<Map<String, Object>> detailsList = (List<Map<String, Object>>) item.get("subjectDetails");
                    if (detailsList == null) continue;
                    System.out.println(detailsList.toString());
                    System.out.println("5");

                    List<SubjectDetails> subjectDetails = new ArrayList<>();
                    for (Map<String, Object> detail : detailsList) {

                        Integer detailHemisId = (Integer) detail.get("id");

                        // safely extract trainingType info
                        Map<String, Object> trainingTypeMap = (Map<String, Object>) detail.get("trainingType");
                        String trainingTypeName = trainingTypeMap != null ? (String) trainingTypeMap.get("name") : null;
                        String trainingCode = trainingTypeMap != null ? (String) trainingTypeMap.get("code") : null;

                        // find existing record
                        SubjectDetails existing = subjectDetailsRepo.findByHemisId(detailHemisId).orElse(null);

                        if (existing != null) {
                            // update fields
                            existing.setTrainingType(trainingTypeName);
                            existing.setTrainingCode(trainingCode);
                            existing.setAcademic_load((Integer) detail.get("academic_load"));

                            subjectDetails.add(subjectDetailsRepo.save(existing)); // update save
                        } else {
                            // create new record
                            SubjectDetails created = subjectDetailsRepo.save(
                                    SubjectDetails.builder()
                                            .hemisId(detailHemisId)
                                            .trainingType(trainingTypeName)
                                            .trainingCode(trainingCode)
                                            .academic_load((Integer) detail.get("academic_load"))
                                            .created(LocalDateTime.now())
                                            .build()
                            );
                            subjectDetails.add(created);
                        }
                    }


                    if (byHemisId.isPresent()){
                        CurriculumSubject curriculumSubject = byHemisId.get();
                        curriculumSubject.setSemesterName(semesterName);
                        curriculumSubject.setSemesterCode(semesterCode);
                        curriculumSubjectRepo.save(curriculumSubject);
                        continue;
                    };
                    System.out.println("2");

                    // Subject
                    Map<String, Object> subjectMap = (Map<String, Object>) item.get("subject");
                    Integer subjectHemisId = (Integer) subjectMap.get("id");
                    System.out.println("3");

                    Subject subject = subjectRepo.findByHemisId(subjectHemisId)
                            .orElseGet(() -> subjectRepo.save(
                                    Subject.builder()
                                            .hemisId(subjectHemisId)
                                            .name((String) subjectMap.get("name"))
                                            .code((String) subjectMap.get("code"))
                                            .build()
                            ));




                    System.out.println("6");

                    // SubjectExamTypes
                    List<Map<String, Object>> examList = (List<Map<String, Object>>) item.get("subjectExamTypes");
                    List<SubjectExamTypes> examTypes = new ArrayList<>();
                    System.out.println("7");

                    for (Map<String, Object> exam : examList) {
                        Integer examHemisId = (Integer) exam.get("id");
                        examTypes.add(subjectExamTypesRepo.findByHemisId(examHemisId)
                                .orElseGet(() -> subjectExamTypesRepo.save(
                                        SubjectExamTypes.builder()
                                                .hemisId(examHemisId)
                                                .examType((String) exam.get("exam_type"))
                                                .max_ball((Integer) exam.get("max_ball"))
                                                .created(LocalDateTime.now())
                                                .build()
                                )));
                    }
                    System.out.println("8");


                    // Departments
                    Map<String, Object> dept = (Map<String, Object>) item.get("department");
                    if (dept == null) continue;
                    Integer deptId = (Integer) dept.get("id");
                    System.out.println("9");


                    Department department = departmentRepo.findByHemisId(deptId)
                            .orElseGet(() -> departmentRepo.save(
                                    Department.builder()
                                            .hemisId(deptId)
                                            .name((String) dept.get("name"))
                                            .code((String) dept.get("code"))
                                            .structureType(((Map<String, Object>) dept.get("structureType")).get("name").toString())
                                            .localityType(((Map<String, Object>) dept.get("localityType")).get("name").toString())
                                            .parent(dept.get("parent") != null ? (Integer) dept.get("parent") : null)
                                            .active((Boolean) dept.get("active"))
                                            .created(LocalDateTime.now())
                                            .build()
                            ));

                    System.out.println("10");

                    // Curriculum
                    Integer curriculumHemisId = (Integer) item.get("_curriculum");
                    Curriculum curriculum = curriculumRepo.findByHemisId(curriculumHemisId)
                            .orElse(null);
                    if (curriculum == null) continue;
                    System.out.println("11");

                    // Save CurriculumSubject
                    CurriculumSubject cs = CurriculumSubject.builder()
                            .hemisId(hemisId)
                            .subject(subject)
                            .subjectBlock((String) item.get("subject_block"))
                            .subjectType((String) item.get("subject_type"))
                            .subjectDetails(subjectDetails)
                            .subjectExamTypes(examTypes)
                            .department(department)
                            .curriculum(curriculum)
                            .totalAcload((Integer) item.get("total_acload"))
                            .resourceCount((Integer) item.get("resource_count"))
                            .in_group((String) item.get("in_group"))
                            .atSemester((Boolean) item.get("at_semester"))
                            .active((Boolean) item.get("active"))
                            .credit((Integer) item.get("credit"))
                            .created_at(Long.valueOf(item.get("created_at").toString()))
                            .updated_at(Long.valueOf(item.get("updated_at").toString()))
                            .isHaveLessons((Boolean) item.get("is_have_lessons"))
                            .created(LocalDateTime.now())
                            .semesterCode(semesterCode)
                            .semesterName(semesterName)
                            .build();

                    curriculumSubjectRepo.save(cs);
                    System.out.println("12");
                    savedCount++;
                }

            } while (page <= totalPages);

            return ResponseEntity.ok("\u2705 Saved " + savedCount + " curriculum subjects.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("\u274C Error occurred: " + e.getMessage());
        }
    }


}
