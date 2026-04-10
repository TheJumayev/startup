package com.example.backend.Controller;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentSubject;
import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.StudentSubjectRepo;
import com.example.backend.Repository.TokenHemisRepo;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/groups")
public class GroupsController {

    private final GroupsRepo groupsRepo;
    private final ExternalApiService externalApiService;
    private final TokenHemisRepo tokenHemisRepo;
    private final StudentRepo studentRepo;
    private final StudentSubjectRepo studentSubjectRepo;

    @GetMapping
    public ResponseEntity<?> getGroups() {
        List<Groups> all = groupsRepo.findAll();
        return ResponseEntity.ok(all);
    }


    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupById(@PathVariable UUID groupId) {
        return groupsRepo.findById(groupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/update-students/all")
    public HttpEntity<?> updateAllGroupsStudents(
            @RequestParam(defaultValue = "200") int sleepMs // throttle between student-info calls
    ) {
        // 🔑 token
        var tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = tokens.get(tokens.size() - 1).getName();
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        // 📚 all groups from DB
        List<Groups> groups = groupsRepo.findAll();
        if (groups.isEmpty()) {
            return ResponseEntity.ok("No groups in DB.");
        }

        // 📊 totals
        int totalStudentsCreated = 0;
        int totalStudentsUpdated = 0;
        int totalSubjectsCreated = 0;
        int totalSubjectsUpdated = 0;
        int totalStudentsSkippedNoId = 0;

        // 📝 per-group messages (short)
        List<String> perGroupSummaries = new ArrayList<>();

        for (Groups group : groups) {
            List<Student> allByGroupId = studentRepo.findAllByGroupId(group.getId());
            for (Student student : allByGroupId) {
                if (!Boolean.TRUE.equals(student.getIsMy())) {
                    student.setGroup(null);
                }
            }

            try {
                var res = syncOneGroup(group, headers, sleepMs);
                totalStudentsCreated   += res.studentsCreated;
                totalStudentsUpdated   += res.studentsUpdated;
                totalSubjectsCreated   += res.subjectsCreated;
                totalSubjectsUpdated   += res.subjectsUpdated;
                totalStudentsSkippedNoId += res.itemsSkippedNoId;

                System.out.printf("group: %s\n", group);
                perGroupSummaries.add(
                        "Group[" + group.getName() + "] → students +"
                                + res.studentsCreated + "/~" + res.studentsUpdated
                                + ", subjects +" + res.subjectsCreated + "/~" + res.subjectsUpdated
                );
            } catch (Exception e) {
                perGroupSummaries.add("Group[" + group.getName() + "] ❌ " + e.getMessage());
            }
        }

        Map<String, Object> payload = Map.of(
                "groupsProcessed", groups.size(),
                "studentsCreated", totalStudentsCreated,
                "studentsUpdated", totalStudentsUpdated,
                "subjectsCreated", totalSubjectsCreated,
                "subjectsUpdated", totalSubjectsUpdated,
                "itemsSkippedNoId", totalStudentsSkippedNoId,
                "sleepMs", sleepMs,
                "summaries", perGroupSummaries
        );
        return ResponseEntity.ok(payload);
    }
    private static final class SyncResult {
        int studentsCreated;
        int studentsUpdated;
        int subjectsCreated;
        int subjectsUpdated;
        int itemsSkippedNoId;
    }

    private SyncResult syncOneGroup(Groups group, Map<String, String> headers, int sleepMs) {
        SyncResult r = new SyncResult();

        // 1) Pull students by group
        ResponseEntity<?> response = externalApiService.sendRequest(
                "v1/data/student-list",
                HttpMethod.GET,
                headers,
                Map.of("_group", group.getHemisId(), "limit", 200, "l", "uz-UZ"),
                null
        );

        if (!(response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map<?, ?> body)) {
            throw new RuntimeException("API error: " + response.getBody());
        }
        if (!Boolean.TRUE.equals(((Map<?, ?>) body).get("success"))) {
            throw new RuntimeException("API returned success=false");
        }

        Map<String, Object> dataRoot = (Map<String, Object>) ((Map<?, ?>) body).get("data");
        if (dataRoot == null || !dataRoot.containsKey("items")) {
            throw new RuntimeException("API: items missing");
        }

        List<Map<String, Object>> items = (List<Map<String, Object>>) dataRoot.get("items");

        for (Map<String, Object> item : items) {
            Integer hemisId = getInt(item.get("id"));
            if (hemisId == null) { r.itemsSkippedNoId++; continue; }

            // 🔁 UPSERT student
            Student student = studentRepo.findByHemisId(hemisId)
                    .orElseGet(() -> Student.builder().hemisId(hemisId).build());
            boolean isNew = (student.getId() == null);

            student.setMetaId(getInt(item.get("meta_id")));
            student.setFullName((String) item.get("full_name"));
            student.setShortName((String) item.get("short_name"));
            student.setFirstName((String) item.get("first_name"));
            student.setSecondName((String) item.get("second_name"));
            student.setThirdName((String) item.get("third_name"));
            student.setGender(extractNested(item, "gender", "name"));
            student.setBirthDate(item.get("birth_date") == null ? null : Long.valueOf(item.get("birth_date").toString()));
            student.setStudentIdNumber((String) item.get("student_id_number"));
            student.setImage((String) item.get("image"));
            student.setAvgGpa(getDouble(item.get("avg_gpa")));
            student.setAvgGrade(getDouble(item.get("avg_grade")));
            student.setTotalCredit(getInt(item.get("total_credit")));
            student.setCountry(extractNested(item, "country", "name"));
            student.setProvince(extractNested(item, "province", "name"));
            student.setCurrentProvince(extractNested(item, "currentProvince", "name"));
            student.setDistrict(extractNested(item, "district", "name"));
            student.setCurrentDistrict(extractNested(item, "currentDistrict", "name"));
            student.setTerrain(extractNested(item, "terrain", "name"));
            student.setCurrentTerrain(extractNested(item, "currentTerrain", "name"));
            student.setCitizenship(extractNested(item, "citizenship", "name"));
            student.setStudentStatus(extractNested(item, "studentStatus", "name"));
            student.setCurriculumId(getInt(item.get("_curriculum")));
            student.setEducationForm(extractNested(item, "educationForm", "name"));
            student.setEducationType(extractNested(item, "educationType", "name"));
            student.setPaymentForm(extractNested(item, "paymentForm", "name"));
            student.setStudentType(extractNested(item, "studentType", "name"));
            student.setSocialCategory(extractNested(item, "socialCategory", "name"));
            student.setAccommodation(extractNested(item, "accommodation", "name"));
            student.setDepartmentName(extractNested(item, "department", "name"));
            student.setSpecialtyName(extractNested(item, "specialty", "name"));
            student.setGroupName(extractNested(item, "group", "name"));
            student.setGroupLang(extractNested(item, "group.educationLang", "name"));
            student.setLevel(extractNested(item, "level", "name"));
            student.setLevelName(extractNested(item, "educationYear", "name"));
            student.setSemester(extractNested(item, "semester", "code"));
            student.setSemesterName(extractNested(item, "semester", "name"));
            student.setEducationYear(extractNested(item, "educationYear", "name"));
            student.setYearOfEnter(getInt(item.get("year_of_enter")));
            student.setRoommateCount(getInt(item.get("roommate_count")));
            student.setIsGraduate(Boolean.TRUE.equals(item.get("is_graduate")));
            student.setTotalAcload(getInt(item.get("total_acload")));
            student.setOther((String) item.get("other"));
            student.setValidateUrl((String) item.get("validateUrl"));
            student.setEmail((String) item.get("email"));
            student.setHash((String) item.get("hash"));
            student.setGroup(group);

            studentRepo.save(student);
            if (isNew) r.studentsCreated++; else r.studentsUpdated++;

            // 💤 throttle before student-info
            try { Thread.sleep(Math.max(0, sleepMs)); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }

            // 2) student-info → upsert StudentSubject
            ResponseEntity<?> infoResp = externalApiService.sendRequest(
                    "v1/data/student-info",
                    HttpMethod.GET,
                    headers,
                    Map.of("student_id", hemisId),
                    null
            );
            if (!(infoResp.getStatusCode().is2xxSuccessful() && infoResp.getBody() instanceof Map<?, ?> infoBody)) {
                continue;
            }
            if (!Boolean.TRUE.equals(infoBody.get("success"))) {
                continue;
            }

            Map<String, Object> data = (Map<String, Object>) infoBody.get("data");
            List<Map<String, Object>> subjects = data == null ? null : (List<Map<String, Object>>) data.get("subjects");
            if (subjects == null) continue;

            for (Map<String, Object> subj : subjects) {
                Integer subjHemisId = getInt(subj.get("id"));
                if (subjHemisId == null) continue;

                var ssOpt = studentSubjectRepo.findByStudent_IdAndHemisId(student.getId(), subjHemisId);
                if (ssOpt.isEmpty()) {
                    // CREATE
                    StudentSubject ss = new StudentSubject();
                    ss.setStudent(student);
                    ss.setHemisId(subjHemisId);
                    ss.setPosition(getInt(subj.get("position")));
                    ss.setName((String) subj.get("name"));
                    ss.setSubjectTypeCode(extractNested(subj, "subjectType", "code"));
                    ss.setSubjectTypeName(extractNested(subj, "subjectType", "name"));
                    ss.setExamFinishCode(extractNested(subj, "examFinish", "code"));
                    ss.setExamFinishName(extractNested(subj, "examFinish", "name"));
                    ss.setSemesterCode(extractNested(subj, "semester", "code"));
                    ss.setSemesterName(extractNested(subj, "semester", "name"));
                    ss.setCredit(getInt(subj.get("credit")));
                    ss.setTotalAcload(getInt(subj.get("total_acload")));
                    ss.setTotalPoint(getInt(subj.get("total_point")));
                    ss.setGrade(getInt(subj.get("grade")));
                    ss.setFinishCreditStatus(subj.get("finish_credit_status") == null ? null
                            : Boolean.valueOf(String.valueOf(subj.get("finish_credit_status"))));
                    ss.setPassed(Boolean.TRUE.equals(subj.get("passed")));
                    studentSubjectRepo.save(ss);
                    r.subjectsCreated++;
                } else {
                    // UPDATE
                    var ss = ssOpt.get();
                    ss.setPosition(getInt(subj.get("position")));
                    ss.setName((String) subj.get("name"));
                    ss.setSubjectTypeCode(extractNested(subj, "subjectType", "code"));
                    ss.setSubjectTypeName(extractNested(subj, "subjectType", "name"));
                    ss.setExamFinishCode(extractNested(subj, "examFinish", "code"));
                    ss.setExamFinishName(extractNested(subj, "examFinish", "name"));
                    ss.setSemesterCode(extractNested(subj, "semester", "code"));
                    ss.setSemesterName(extractNested(subj, "semester", "name"));
                    ss.setCredit(getInt(subj.get("credit")));
                    ss.setTotalAcload(getInt(subj.get("total_acload")));
                    ss.setTotalPoint(getInt(subj.get("total_point")));
                    ss.setGrade(getInt(subj.get("grade")));
                    ss.setFinishCreditStatus(subj.get("finish_credit_status") == null ? null
                            : Boolean.valueOf(String.valueOf(subj.get("finish_credit_status"))));
                    ss.setPassed(Boolean.TRUE.equals(subj.get("passed")));
                    studentSubjectRepo.save(ss);
                    r.subjectsUpdated++;
                }
            }
        }

        return r;
    }






    @GetMapping("/update")
    public ResponseEntity<?> updateGroupsFromExternal() {
        System.out.println("▶️ Starting group update...");

        int page = 1;
        int maxPages = 100;
        int savedCount = 0;

        // 1. Get token from DB
        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        System.out.println("🔑 Token: " + token);

        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        try {
            while (page <= maxPages) {
                ResponseEntity<?> response = externalApiService.sendRequest(
                        "v1/data/group-list",
                        HttpMethod.GET,
                        headers,
                        Map.of("page", page, "l", "uz-UZ"),  // ✅ Added language param
                        null
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
                    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

                    Boolean success = (Boolean) responseBody.get("success");
                    if (!Boolean.TRUE.equals(success)) {
                        String error = (String) responseBody.getOrDefault("error", "Unknown error");
                        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                                .body("⚠️ API responded with error: " + error);
                    }

                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    if (data != null && data.containsKey("items")) {
                        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                        for (Map<String, Object> groupData : items) {
                            Groups group = mapToGroupEntity(groupData);
                            Optional<Object> byHemisId = groupsRepo.findByHemisId(group.getHemisId());
                            if (!byHemisId.isPresent()) {

                                groupsRepo.save(group);
                                savedCount++;
                            }else {
                                Groups o = (Groups) byHemisId.get();
                                o.setCurriculum(group.getCurriculum());

                                groupsRepo.save(o);
                            }
                        }
                    }

                    page++;
                } else {
                    return ResponseEntity.status(response.getStatusCode())
                            .body("❌ Failed on page " + page + ": " + response.getBody());
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Exception while saving groups: " + e.getMessage());
        }

        return ResponseEntity.ok("✅ Groups sync complete. New groups saved: " + savedCount);
    }

    private Groups mapToGroupEntity(Map<String, Object> groupData) {
        System.out.printf("mapToGroupEntity: %s\n", groupData);
        String name = (String) groupData.get("name");
        Integer hemisId = (Integer) groupData.get("id");
        Integer curriculum = (Integer) groupData.get("_curriculum");

        System.out.printf("curriculum: %s\n", curriculum);
        String departmentName = extractNestedField(groupData, "department", "name");
        Integer departmentId = null;

        if (groupData.containsKey("department") && groupData.get("department") instanceof Map) {
            Map<String, Object> departmentMap = (Map<String, Object>) groupData.get("department");
            if (departmentMap.containsKey("id")) {
                Object idObj = departmentMap.get("id");
                departmentId = (idObj instanceof Integer) ? (Integer) idObj : Integer.parseInt(idObj.toString());
            }
        }

        String specialtyName = extractNestedField(groupData, "specialty", "name");

        return new Groups(hemisId, name, departmentId, departmentName, specialtyName, LocalDateTime.now(), curriculum);
    }

    private String extractNestedField(Map<String, Object> data, String field, String subField) {
        if (data.containsKey(field)) {
            Object fieldObj = data.get(field);
            if (fieldObj instanceof Map) {
                Map<String, Object> nested = (Map<String, Object>) fieldObj;
                if (nested.containsKey(subField)) {
                    return (String) nested.get(subField);
                }
            }
        }
        return null;
    }




    @GetMapping("/students/{groupId}")
    public ResponseEntity<?> getStudentsByGroupId(@PathVariable UUID groupId) {
        List<Student> students = studentRepo.findAllByGroupId(groupId);
        return ResponseEntity.ok(students);
    }

    // import org.springframework.transaction.annotation.Transactional;

    @GetMapping("/update-students/{groupId}")
    public ResponseEntity<?> updateGroupStudents(@PathVariable UUID groupId) {
        var groupOpt = groupsRepo.findById(groupId);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
        }
        Groups group = groupOpt.get();
        var all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = all.get(all.size() - 1).getName();
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);
        List<Student> allByGroupId = studentRepo.findAllByGroupId(groupId);
        for (Student student : allByGroupId) {
            if (!Boolean.TRUE.equals(student.getIsMy())) {
                student.setGroup(null);
            }
        }
        try {
            // 1) Pull students by group
            ResponseEntity<?> response = externalApiService.sendRequest(
                    "v1/data/student-list",
                    HttpMethod.GET,
                    headers,
                    Map.of("_group", group.getHemisId(),"limit",200 ,"l", "uz-UZ"),
                    null
            );

            if (!(response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map<?, ?> body)) {
                return ResponseEntity.status(response.getStatusCode()).body("❌ API error: " + response.getBody());
            }
            if (!Boolean.TRUE.equals(((Map<?, ?>) body).get("success"))) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("API error: " + ((Map<?, ?>) body).get("error"));
            }

            Map<String, Object> dataRoot = (Map<String, Object>) ((Map<?, ?>) body).get("data");
            if (dataRoot == null || !dataRoot.containsKey("items")) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("❌ API: items missing");
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) dataRoot.get("items");

            System.out.println(items);
            int studentsCreated = 0;
            int studentsUpdated = 0;
            int subjectsUpdated = 0;
            int subjectsSkippedNoRow = 0;
            int itemsSkippedNoId = 0;

            for (Map<String, Object> item : items) {
                Integer hemisId = getInt(item.get("id"));
                if (hemisId == null) { itemsSkippedNoId++; continue; }

                // 🔁 UPSERT (create if missing, update if exists)
                Student student = studentRepo.findByHemisId(hemisId)
                        .orElseGet(() -> Student.builder().hemisId(hemisId).build());
                boolean isNew = (student.getId() == null);

                // --- fill student fields ---
                student.setMetaId(getInt(item.get("meta_id")));
                student.setFullName((String) item.get("full_name"));
                student.setShortName((String) item.get("short_name"));
                student.setFirstName((String) item.get("first_name"));
                student.setSecondName((String) item.get("second_name"));
                student.setThirdName((String) item.get("third_name"));
                student.setGender(extractNested(item, "gender", "name"));
                student.setBirthDate(item.get("birth_date") == null ? null : Long.valueOf(item.get("birth_date").toString()));
                student.setStudentIdNumber((String) item.get("student_id_number"));
                student.setImage((String) item.get("image"));
                student.setAvgGpa(getDouble(item.get("avg_gpa")));
                student.setAvgGrade(getDouble(item.get("avg_grade")));
                student.setTotalCredit(getInt(item.get("total_credit")));
                student.setCountry(extractNested(item, "country", "name"));
                student.setProvince(extractNested(item, "province", "name"));
                student.setCurrentProvince(extractNested(item, "currentProvince", "name"));
                student.setDistrict(extractNested(item, "district", "name"));
                student.setCurrentDistrict(extractNested(item, "currentDistrict", "name"));
                student.setTerrain(extractNested(item, "terrain", "name"));
                student.setCurrentTerrain(extractNested(item, "currentTerrain", "name"));
                student.setCitizenship(extractNested(item, "citizenship", "name"));
                student.setStudentStatus(extractNested(item, "studentStatus", "name"));
                student.setCurriculumId(getInt(item.get("_curriculum")));
                student.setEducationForm(extractNested(item, "educationForm", "name"));
                student.setEducationType(extractNested(item, "educationType", "name"));
                student.setPaymentForm(extractNested(item, "paymentForm", "name"));
                student.setStudentType(extractNested(item, "studentType", "name"));
                student.setSocialCategory(extractNested(item, "socialCategory", "name"));
                student.setAccommodation(extractNested(item, "accommodation", "name"));
                student.setDepartmentName(extractNested(item, "department", "name"));
                student.setSpecialtyName(extractNested(item, "specialty", "name"));
                student.setGroupName(extractNested(item, "group", "name"));
                student.setGroupLang(extractNested(item, "group.educationLang", "name"));
                student.setLevel(extractNested(item, "level", "name"));
                student.setLevelName(extractNested(item, "educationYear", "name"));
                student.setSemester(extractNested(item, "semester", "code"));
                student.setSemesterName(extractNested(item, "semester", "name"));
                student.setEducationYear(extractNested(item, "educationYear", "name"));
                student.setYearOfEnter(getInt(item.get("year_of_enter")));
                student.setRoommateCount(getInt(item.get("roommate_count")));
                student.setIsGraduate(Boolean.TRUE.equals(item.get("is_graduate")));
                student.setTotalAcload(getInt(item.get("total_acload")));
                student.setOther((String) item.get("other"));
                student.setValidateUrl((String) item.get("validateUrl"));
                student.setEmail((String) item.get("email"));
                student.setHash((String) item.get("hash"));
                student.setGroup(group);

                studentRepo.save(student);
                if (isNew) studentsCreated++; else studentsUpdated++;

                // 🔹 backoff to be gentle with API
                try { Thread.sleep(200); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }

                // 2) Pull detailed student-info only to update existing StudentSubject rows
                ResponseEntity<?> infoResp = externalApiService.sendRequest(
                        "v1/data/student-info",
                        HttpMethod.GET,
                        headers,
                        Map.of("student_id", hemisId),
                        null
                );
                if (!(infoResp.getStatusCode().is2xxSuccessful() && infoResp.getBody() instanceof Map<?, ?> infoBody)) {
                    continue;
                }
                if (!Boolean.TRUE.equals(infoBody.get("success"))) {
                    continue;
                }

                Map<String, Object> data = (Map<String, Object>) infoBody.get("data");
                List<Map<String, Object>> subjects = data == null ? null : (List<Map<String, Object>>) data.get("subjects");
                if (subjects == null) continue;
                System.out.println("salom");
                for (Map<String, Object> subj : subjects) {
                    Integer subjHemisId = getInt(subj.get("id"));
                    System.out.printf("subjHemisId: %s%n", String.valueOf(subjHemisId));
                    if (subjHemisId == null) continue;

                    var ssOpt = studentSubjectRepo.findByStudent_IdAndHemisId(student.getId(), subjHemisId);

                    // Map common fields from payload → entity
                    if (ssOpt.isEmpty()) {
                        // 🔹 CREATE new StudentSubject
                        StudentSubject ss = new StudentSubject();
                        ss.setStudent(student);
                        ss.setHemisId(subjHemisId);

                        ss.setPosition(getInt(subj.get("position")));
                        ss.setName((String) subj.get("name"));

                        ss.setSubjectTypeCode(extractNested(subj, "subjectType", "code"));
                        ss.setSubjectTypeName(extractNested(subj, "subjectType", "name"));

                        ss.setExamFinishCode(extractNested(subj, "examFinish", "code"));
                        ss.setExamFinishName(extractNested(subj, "examFinish", "name"));

                        ss.setSemesterCode(extractNested(subj, "semester", "code"));
                        ss.setSemesterName(extractNested(subj, "semester", "name"));

                        ss.setCredit(getInt(subj.get("credit")));
                        ss.setTotalAcload(getInt(subj.get("total_acload")));
                        ss.setTotalPoint(getInt(subj.get("total_point")));
                        ss.setGrade(getInt(subj.get("grade")));

                        ss.setFinishCreditStatus(
                                subj.get("finish_credit_status") == null ? null :
                                        Boolean.valueOf(String.valueOf(subj.get("finish_credit_status")))
                        );
                        ss.setPassed(Boolean.TRUE.equals(subj.get("passed")));

                        studentSubjectRepo.save(ss);

                    } else {
                        // 🔧 UPDATE existing StudentSubject
                        var ss = ssOpt.get();
                        ss.setPosition(getInt(subj.get("position")));
                        ss.setName((String) subj.get("name"));

                        ss.setSubjectTypeCode(extractNested(subj, "subjectType", "code"));
                        ss.setSubjectTypeName(extractNested(subj, "subjectType", "name"));

                        ss.setExamFinishCode(extractNested(subj, "examFinish", "code"));
                        ss.setExamFinishName(extractNested(subj, "examFinish", "name"));

                        ss.setSemesterCode(extractNested(subj, "semester", "code"));
                        ss.setSemesterName(extractNested(subj, "semester", "name"));

                        ss.setCredit(getInt(subj.get("credit")));
                        ss.setTotalAcload(getInt(subj.get("total_acload")));
                        ss.setTotalPoint(getInt(subj.get("total_point")));
                        ss.setGrade(getInt(subj.get("grade")));

                        ss.setFinishCreditStatus(
                                subj.get("finish_credit_status") == null ? null :
                                        Boolean.valueOf(String.valueOf(subj.get("finish_credit_status")))
                        );
                        ss.setPassed(Boolean.TRUE.equals(subj.get("passed")));

                        studentSubjectRepo.save(ss);
                        subjectsUpdated++;
                    }
                }

            }

            String msg = "✅ Students created: %d, updated: %d, skipped-no-id: %d; StudentSubjects updated: %d (skipped no-row: %d)"
                    .formatted(studentsCreated, studentsUpdated, itemsSkippedNoId, subjectsUpdated, subjectsSkippedNoRow);
            return ResponseEntity.ok(msg);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Exception occurred: " + e.getMessage());
        }
    }

    // --- Helpers (same controller) ---
    private String extractNested(Map<String, Object> data, String key, String subKey) {
        if (!data.containsKey(key)) return null;
        Object obj = data.get(key);
        if (obj instanceof Map<?, ?> map && map.containsKey(subKey)) {
            return String.valueOf(map.get(subKey));
        }
        return null;
    }
    private Double getDouble(Object val) {
        if (val == null) return null;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }
    private Integer getInt(Object val) {
        if (val == null) return null;
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return null; }
    }

    // -------- Optional: Read back subjects by student ----------
    @GetMapping("/student-subjects/{studentId}")
    public ResponseEntity<?> getStudentSubjects(@PathVariable UUID studentId) {
        return ResponseEntity.ok(studentSubjectRepo.findAllByStudent_IdOrderByPositionAsc(studentId));
    }


    @GetMapping("/not-passed/{groupId}")
    public ResponseEntity<?> getNotPassedByGroup(
            @PathVariable UUID groupId,
            @RequestParam(defaultValue = "true") boolean examOnly
    ) {
        var students = studentSubjectRepo.findStudentsNotPassedByGroup(groupId, examOnly);
        var subjects = studentSubjectRepo.findNotPassedSubjectsByGroup(groupId, examOnly);

        var payload = Map.of(
                "groupId", groupId,
                "examOnly", examOnly,
                "countStudents", students.size(),
                "countSubjects", subjects.size(),
                "students", students,
                "subjects", subjects
        );
        return ResponseEntity.ok(payload);
    }

}
