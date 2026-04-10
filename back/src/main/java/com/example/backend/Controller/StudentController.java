package com.example.backend.Controller;

import com.example.backend.DTO.StudentDTO;
import com.example.backend.DTO.StudentLoginDTO;
import com.example.backend.DTO.StudentSubjectDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentSubject;
import com.example.backend.Entity.TestCenterCode;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.TestCenterCodeRepo;
import com.example.backend.Security.JwtService;
import com.example.backend.Security.JwtServiceStudent;
import com.example.backend.Services.ExternalApiService;
import jakarta.persistence.ManyToOne;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentRepo studentRepo;
    private final JwtServiceStudent jwtServiceStudent;
    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);
    private final ExternalApiService externalApiService;
    // ADD these fields to your controller (alongside studentRepo / externalApiService)
    private final com.example.backend.Repository.TokenHemisRepo tokenHemisRepo;
    private final com.example.backend.Repository.StudentSubjectRepo studentSubjectRepo;
    private final TestCenterCodeRepo testCenterCodeRepo;
    private final AttachmentRepo attachmentRepo;

    @GetMapping("/all")
    public HttpEntity<?> getAllStudents() {
        List<Student> all = studentRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }



    @GetMapping("/appeal/{studentIdNumber}")
    public HttpEntity<?> getStudentIdNumber(@PathVariable String studentIdNumber){
        Optional<Student> stu= studentRepo.findByStudentIdNumber(studentIdNumber);
        if(stu.isPresent()){
            return new ResponseEntity<>(stu.get().getStudentIdNumber(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/appeal-infos/{studentId}")
    public HttpEntity<?> getStudentId(@PathVariable String studentId){
        Optional<Student> stu= studentRepo.findByStudentIdNumber(studentId);
        if(stu.isPresent()){
            return new ResponseEntity<>(stu, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // --- UPDATE JUST ONE STUDENT FROM HEMIS ---
    @GetMapping("/student-info/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable String studentId) {
        Optional<Student>student1= studentRepo.findByStudentIdNumber(studentId);
        // 0) Find local student
        if (student1.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }
        Student student = student1.get();
        if (student.getHemisId() == null) {
            return ResponseEntity.badRequest().body("Student has no hemisId");
        }

        // 1) Token
        var tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = tokens.get(tokens.size() - 1).getName();

        // 2) Call HEMIS: v1/data/student-info?student_id={hemisId}
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);
        ResponseEntity<?> resp = externalApiService.sendRequest(
                "v1/data/student-info",
                HttpMethod.GET,
                headers,
                Map.of("student_id", student.getHemisId(), "l", "uz-UZ"),
                null
        );

        if (!(resp.getStatusCode().is2xxSuccessful() && resp.getBody() instanceof Map<?, ?> body)) {
            return ResponseEntity.status(resp.getStatusCode()).body("❌ API error: " + resp.getBody());
        }
        if (!Boolean.TRUE.equals(((Map<?, ?>) body).get("success"))) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("API error: " + ((Map<?, ?>) body).get("error"));
        }

        Map<String, Object> data = (Map<String, Object>) ((Map<?, ?>) body).get("data");
        if (data == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("❌ API: data missing");
        }

        // 3) Map student fields (same style as your group updater)
        student.setMetaId(getInt(data.get("meta_id")));
        student.setFullName((String) data.get("full_name"));
        student.setShortName((String) data.get("short_name"));
        student.setFirstName((String) data.get("first_name"));
        student.setSecondName((String) data.get("second_name"));
        student.setThirdName((String) data.get("third_name"));
        student.setGender(extractNested(data, "gender", "name"));
        student.setBirthDate(data.get("birth_date") == null ? null : Long.valueOf(data.get("birth_date").toString()));
        student.setStudentIdNumber((String) data.get("student_id_number"));
        student.setImage((String) data.get("image"));
        student.setAvgGpa(getDouble(data.get("avg_gpa")));
        student.setAvgGrade(getDouble(data.get("avg_grade")));
        student.setTotalCredit(getInt(data.get("total_credit")));
        student.setCountry(extractNested(data, "country", "name"));
        student.setProvince(extractNested(data, "province", "name"));
        student.setCurrentProvince(extractNested(data, "currentProvince", "name"));
        student.setDistrict(extractNested(data, "district", "name"));
        student.setCurrentDistrict(extractNested(data, "currentDistrict", "name"));
        student.setTerrain(extractNested(data, "terrain", "name"));
        student.setCurrentTerrain(extractNested(data, "currentTerrain", "name"));
        student.setCitizenship(extractNested(data, "citizenship", "name"));
        student.setStudentStatus(extractNested(data, "studentStatus", "name"));
        student.setCurriculumId(getInt(data.get("_curriculum")));
        student.setEducationForm(extractNested(data, "educationForm", "name"));
        student.setEducationType(extractNested(data, "educationType", "name"));
        student.setPaymentForm(extractNested(data, "paymentForm", "name"));
        student.setStudentType(extractNested(data, "studentType", "name"));
        student.setSocialCategory(extractNested(data, "socialCategory", "name"));
        student.setAccommodation(extractNested(data, "accommodation", "name"));
        student.setDepartmentName(extractNested(data, "department", "name"));
        student.setSpecialtyName(extractNested(data, "specialty", "name"));
        student.setGroupName(extractNested(data, "group", "name"));
        student.setGroupLang(extractNested(data, "group.educationLang", "name"));
        student.setLevel(extractNested(data, "level", "name"));
        student.setLevelName(extractNested(data, "educationYear", "name"));
        student.setSemester(extractNested(data, "semester", "code"));
        student.setSemesterName(extractNested(data, "semester", "name"));
        student.setEducationYear(extractNested(data, "educationYear", "name"));
        student.setYearOfEnter(getInt(data.get("year_of_enter")));
        student.setRoommateCount(getInt(data.get("roommate_count")));
        student.setIsGraduate(Boolean.TRUE.equals(data.get("is_graduate")));
        student.setTotalAcload(getInt(data.get("total_acload")));
        student.setOther((String) data.get("other"));
        student.setValidateUrl((String) data.get("validateUrl"));
        student.setEmail((String) data.get("email"));
        student.setHash((String) data.get("hash"));

        studentRepo.save(student);

        // 4) Upsert StudentSubjects (if present)
        int subjectsCreated = 0, subjectsUpdated = 0;
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("subjects");
        if (subjects != null) {
            for (Map<String, Object> subj : subjects) {
                Integer subjHemisId = getInt(subj.get("id"));
                if (subjHemisId == null) continue;

                var optSS = studentSubjectRepo.findByStudent_IdAndHemisId(student.getId(), subjHemisId);
                if (optSS.isEmpty()) {
                    var ss = new com.example.backend.Entity.StudentSubject();
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
                    subjectsCreated++;
                } else {
                    var ss = optSS.get();
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
        System.out.println(subjects);

        return ResponseEntity.ok(subjects);
//        return ResponseEntity.ok(Map.of(
//                "message", "✅ Student updated",
//                "studentId", studentId,
//                "subjectsCreated", subjectsCreated,
//                "subjectsUpdated", subjectsUpdated
//        ));
    }

    /* ----- small helpers (same as your group updater) ----- */
    private String extractNested(Map<String, Object> data, String key, String subKey) {
        if (!data.containsKey(key)) return null;
        Object obj = data.get(key);
        if (obj instanceof Map<?, ?> map && map.containsKey(subKey)) {
            return String.valueOf(map.get(subKey));
        }
        // support dotted keys like "group.educationLang"
        if (key.contains(".")) {
            Object cur = data;
            for (String k : key.split("\\.")) {
                if (!(cur instanceof Map<?, ?> m)) return null;
                cur = m.get(k);
                if (cur == null) return null;
            }
            if (cur instanceof Map<?, ?> m2 && m2.containsKey(subKey)) {
                return String.valueOf(m2.get(subKey));
            }
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



    @PostMapping("/{studentId}")
    public ResponseEntity<?> addStudentSubject(@PathVariable UUID studentId,
                                               @RequestBody StudentSubjectDTO dto) {
        Student student = studentRepo.findById(studentId)

                .orElseThrow(() -> new RuntimeException("Student topilmadi"));
        Optional<StudentSubject> existing =
                studentSubjectRepo.findByStudent_IdAndHemisIdAndSemesterCode(
                        studentId,
                        dto.getHemisId(),
                        dto.getSemesterCode()
                );


        if (existing.isPresent()) {
            StudentSubject studentSubject = existing.get();
            studentSubject.setPassed(false);
            studentSubject.setPayed(null);
            studentSubject.setPayedTime(null);
            studentSubject.setAmount(null);
            StudentSubject saved = studentSubjectRepo.save(studentSubject);
            return ResponseEntity.ok(saved);
        }else{

        // 3. DTO -> Entity map qilish
        StudentSubject subject = StudentSubject.builder()
                .student(student)
                .credit(dto.getCredit())
                .examFinishCode(dto.getExamFinishCode())
                .examFinishName(dto.getExamFinishName())
                .grade(dto.getGrade())
                .hemisId(dto.getHemisId())
                .name(dto.getName())
                .passed(dto.getPassed())
                .position(dto.getPosition())
                .subjectTypeCode(dto.getSubjectTypeCode())
                .subjectTypeName(dto.getSubjectTypeName())
                .semesterCode(dto.getSemesterCode())
                .semesterName(dto.getSemesterName())
                .totalAcload(dto.getTotalAcload())
                .totalPoint(dto.getTotalPoint())
                .finishCreditStatus(dto.getFinishCreditStatus())
                .build();

        // 4. Saqlash
        StudentSubject saved = studentSubjectRepo.save(subject);

        return ResponseEntity.ok(saved);
        }
    }





    @GetMapping("/byid/{studentId}")
    public HttpEntity<?> getStudentById(@PathVariable UUID studentId){

        Optional<Student> byId = studentRepo.findById(studentId);
        if(byId.isPresent()){
            return ResponseEntity.ok(byId.get());
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/password")
    public HttpEntity<?> changePassword(@RequestBody StudentLoginDTO studentLoginDTO) {
        Optional<Student> byStudentIdNumber = studentRepo.findByStudentIdNumber(studentLoginDTO.getLogin());

        if(byStudentIdNumber.isPresent()){
            Student student = byStudentIdNumber.get();
            student.setPassword(studentLoginDTO.getPassword());
            studentRepo.save(student);
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login xato");
    }


    @PostMapping("/login/me")
    public HttpEntity<?> loginMe(@RequestBody StudentLoginDTO studentLoginDTO) {

        Optional<Student> byStudentIdNumber = studentRepo.findByStudentIdNumber(studentLoginDTO.getLogin());

        if(byStudentIdNumber.isPresent()){
            System.out.println(byStudentIdNumber.get());
            if(byStudentIdNumber.get().getPassword().equals(studentLoginDTO.getPassword())){
                String s = jwtServiceStudent.generateJwtToken(byStudentIdNumber.get());
                return ResponseEntity.ok(s);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Parol xato");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login xato");
    }
    @GetMapping("/account/all/me/{token}")
    public HttpEntity<?> getStudentAllDataByTokenMe(@PathVariable String token) {
        try {
            String studenIdString = jwtServiceStudent.extractSubjectFromJwt(token);
            Student student = studentRepo.findById(UUID.fromString(studenIdString)).orElseThrow(() -> new RuntimeException("Student not found"));
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            logger.error("Error fetching student data by token: ", e);
            return new ResponseEntity<>("Error occurred while fetching student data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


//    bu hemis bn qilingan
    @PostMapping("/login")
    public HttpEntity<?> login(@RequestBody StudentLoginDTO studentLoginDTO) {
        System.out.println(studentLoginDTO);
        try {
            RestTemplate restTemplate = new RestTemplate(); // No custom factory needed
            String loginUrl = "https://student.buxpxti.uz/rest/v1/auth/login";

            // Prepare login payload
            Map<String, String> loginPayload = Map.of(
                    "login", studentLoginDTO.getLogin(),
                    "password", studentLoginDTO.getPassword()
            );

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            // Create request entity
            HttpEntity<Map<String, String>> request = new HttpEntity<>(loginPayload, headers);


            ResponseEntity<Map> response = restTemplate.exchange(
                    loginUrl,
                    HttpMethod.POST,
                    request,
                    Map.class
            );


            // Handle response
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    String token = (String) data.get("token");
                    System.out.printf("token: %s", token);
                    System.out.printf("1");

                    return ResponseEntity.ok(token);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Login succeeded but token missing.");

                }
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid login credentials");
            }

        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/login/exam")
    public HttpEntity<?> loginExam(@RequestBody StudentLoginDTO studentLoginDTO) {
        Integer code = Integer.valueOf(studentLoginDTO.getPassword());
        System.out.println(studentLoginDTO.getPassword());
        System.out.println(studentLoginDTO.getLogin());
        Optional<TestCenterCode> testCenterCode = testCenterCodeRepo.findByCode(code);
        if(testCenterCode.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid login credentials");
        }
        Optional<Student> byStudentIdNumber = studentRepo.findByStudentIdNumber(studentLoginDTO.getLogin());
        if(byStudentIdNumber.isPresent()){
            return ResponseEntity.ok(byStudentIdNumber.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid login credentials");
    }


    // Get a list of students by group name
    @GetMapping("/group/{groupName}")
    public HttpEntity<?> getStudentsByGroup(@PathVariable String groupName) {
        List<Student> studentsInGroup = studentRepo.findAllByGroup(groupName);
        return ResponseEntity.ok(studentsInGroup);
    }
    // Get a student by passport pin
    @GetMapping("/{passportPin}")
    public HttpEntity<?> getStudentByPassportPin(@PathVariable String passportPin) {
        Student student = studentRepo.findByPassport_pin(passportPin)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return ResponseEntity.ok(student);
    }




//    bu hemis bn qilingan
    @GetMapping("/account/all/{token}")
    public HttpEntity<?> getStudentAllDataByToken(@PathVariable String token) {
        try {
            System.out.println(token);
            RestTemplate restTemplate = new RestTemplate();
            String externalApiUrl = "https://student.buxpxti.uz/rest/v1/account/me";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    externalApiUrl,
                    HttpMethod.GET,
                    request,
                    Map.class
            );

            // Check if the response is OK and process the data
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                Map<String, Object> group = (Map<String, Object>) data.get("group");
                Map<String, Object> level = (Map<String, Object>) data.get("level");


                Object idObj = data.get("id");
                if (idObj == null) {
                    return ResponseEntity.badRequest().body("Missing 'id' in data");
                }
                Integer hemisId = (idObj instanceof Number)
                        ? ((Number) idObj).intValue()
                        : Integer.parseInt(idObj.toString());

                // Student’ni DB’dan topish yoki yaratish
                Student student = studentRepo.findByHemisId(hemisId).orElseGet(Student::new);

                System.out.printf("student: %s", student);
                return ResponseEntity.ok(student); // Save or update the student
            } else {
                return new ResponseEntity<>("Failed to fetch student data", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            logger.error("Error fetching student data by token: ", e);
            return new ResponseEntity<>("Error occurred while fetching student data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/debt/{token}")
    public HttpEntity<?> getDebtOfStudent(@PathVariable String token) {
        try {
            System.out.println(token);
            RestTemplate restTemplate = new RestTemplate();
            String externalApiUrl = "https://student.buxpxti.uz/rest/v1/education/subject-list";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    externalApiUrl,
                    HttpMethod.GET,
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                Object data = responseBody.get("data");

                if (data instanceof List) {
                    List<?> dataList = (List<?>) data;

                    // Filter and transform the list based on the required criteria
                    List<Map<String, Object>> filteredResults = dataList.stream()
                            .filter(item -> {
                                Map<String, Object> overallScore = (Map<String, Object>) ((Map<String, Object>) item).get("overallScore");
                                return overallScore != null &&
                                        (int) overallScore.get("grade") < 0.6 * (int) overallScore.get("max_ball");
                            })

                            .map(item -> {
                                Map<String, Object> curriculumSubject = (Map<String, Object>) ((Map<String, Object>) item).get("curriculumSubject");
                                Map<String, Object> subject = (Map<String, Object>) curriculumSubject.get("subject");
                                Map<String, Object> overallScore = (Map<String, Object>) ((Map<String, Object>) item).get("overallScore");

                                Map<String, Object> result = Map.of(
                                        "_semester", ((Map<String, Object>) item).get("_semester"),
                                        "credit", curriculumSubject.get("credit"),
                                        "total_acload", curriculumSubject.get("total_acload"),
                                        "subjectName", subject.get("name"),
                                        "overallScore", Map.of(
                                                "grade", overallScore.get("grade"),
                                                "max_ball", overallScore.get("max_ball"),
                                                "percent", overallScore.get("percent"),
                                                "label", overallScore.get("label")
                                        )
                                );
                                return result;
                            })
                            .toList();

                    return ResponseEntity.ok(filteredResults);
                } else {
                    return new ResponseEntity<>("Unexpected data format", HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("Failed to fetch student data", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            logger.error("Error fetching student data by token: ", e);
            return new ResponseEntity<>("Error occurred while fetching student data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/invalid/{id}")
    public HttpEntity<?> invalidStudent(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Attachment nogironFile = dto.getNogironFile();
        if (nogironFile == null) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setNogironFile(dto.getNogironFile());
        student1.setNogiron(true);
        student1.setNogironType(dto.getNogironType());
        student1.setNogironText(dto.getNogironText());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);

    }
    @PutMapping("/ielts/{id}")
    public HttpEntity<?> ielts(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Attachment ieltsFile = dto.getIeltsFile();
        if (ieltsFile == null) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setIeltsFile(dto.getIeltsFile());
        student1.setIeltsText(dto.getIeltsText());
        student1.setIelts(true);
        student1.setEndDate(dto.getEndDate());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/qabul/{id}")
    public HttpEntity<?> qabuls(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setQabulBuyruqRaqami(dto.getQabulBuyruqRaqami());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("kurs/{id}")
    public HttpEntity<?> kurs(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setKursdanOtganBuyruqRaqami(dto.getKursdanOtganBuyruqRaqami());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/ichki/{id}")
    public HttpEntity<?> ichki(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setKursdanOtganBuyruqRaqami(dto.getKursdanOtganBuyruqRaqami());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/tashqi/{id}")
    public HttpEntity<?> tashqi(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setTashqiPerevodBuyruqRaqami(dto.getTashqiPerevodBuyruqRaqami());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/talaba/{id}")
    public HttpEntity<?> talaba(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setTalabalarSafidanChetlashganBuyruqRaqami(dto.getTalabalarSafidanChetlashganBuyruqRaqami());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/erkin/{id}")
    public HttpEntity<?> erkin(@PathVariable UUID id, @RequestBody StudentDTO dto) {
        Optional<Student> student = studentRepo.findById(id);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student1 = student.get();
        student1.setEndErkinJadval(dto.getEndErkinJadval());
        Student save = studentRepo.save(student1);
        return ResponseEntity.ok(save);
    }



    @GetMapping("/is-group-leader/{studentId}")
    public ResponseEntity<?> changeIsLeader(@PathVariable UUID studentId) {

        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = byId.get();

        Boolean isLeader = student.getIsGroupLeader();

        if (isLeader == null) {
            student.setIsGroupLeader(true);      // agar null bo‘lsa → true
        } else {
            student.setIsGroupLeader(!isLeader); // aks holda toggle
        }

        System.out.println(student);
        Student saved = studentRepo.save(student);
        return ResponseEntity.ok(saved);
    }






    @PutMapping("/phone/{studentId}")
    public HttpEntity<?> changePhoneStudent(@RequestBody StudentDTO studentDTO, @PathVariable UUID studentId){
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Student student = byId.get();
        System.out.println(studentDTO.getPhone());
        student.setPhone(studentDTO.getPhone());
        Student save = studentRepo.save(student);
        return ResponseEntity.ok(save);
    }



    @PutMapping("/work/{studentId}")
    public HttpEntity<?> changeWorkStudent(@RequestBody StudentDTO studentDTO, @PathVariable UUID studentId){
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Student student = byId.get();
        if (studentDTO.getIsHaveWork()){
            Attachment attachment = attachmentRepo.findById(studentDTO.getWorkFile()).orElseThrow();
            student.setIsHaveWork(true);
            student.setWorkFile(attachment);

        }else {
            student.setIsHaveWork(false);
            student.setWorkFile(null);
        }
        Student save = studentRepo.save(student);
        return ResponseEntity.ok(save);

    }


    @GetMapping("/update-certificate")
    public HttpEntity<?> updateCertificates() {
        List<Student> all = studentRepo.findAll();

        // Retrieve the latest token
        var tokens = tokenHemisRepo.findAll();
        if (tokens.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Token not found");
        }
        String token = tokens.get(tokens.size() - 1).getName();

        // Set authorization headers
        Map<String, String> headers = Map.of("Authorization", "Bearer " + token);

        // Iterate over all students and fetch certificates
        for (Student student : all) {
            System.out.println(student.getHemisId());

            // Fetch certificates from the external API
            ResponseEntity<?> response = externalApiService.sendRequest(
                    "v1/data/student-certificate-list",
                    HttpMethod.GET,
                    headers,
                    Map.of("_student", student.getHemisId()),
                    null
            );

            // Ensure the response was successful and the body is a Map
            if (!(response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map<?, ?> body)) {
                throw new RuntimeException("API error: " + response.getBody());
            }

            // Check if the success field is true in the response
            if (!Boolean.TRUE.equals(((Map<?, ?>) body).get("success"))) {
                throw new RuntimeException("API returned success=false");
            }

            // Extract the "data" field
            Map<String, Object> dataRoot = (Map<String, Object>) ((Map<?, ?>) body).get("data");
            if (dataRoot == null || !dataRoot.containsKey("items")) {
                throw new RuntimeException("API: items missing");
            }

            // Extract certificate items from the response
            List<Map<String, Object>> items = (List<Map<String, Object>>) dataRoot.get("items");
            if (items != null && !items.isEmpty()) {
                // Process each certificate item
                for (Map<String, Object> item : items) {
                    // Extract relevant data for the student
                    String certificateNumber = (String) item.get("ser_number");
                    System.out.println(student.getFullName());
                    System.out.println(certificateNumber);
                    Map<String, Object> certificateName = (Map<String, Object>) item.get("certificateName");
                    Map<String, Object> certificateGrade = (Map<String, Object>) item.get("certificateGrade");

                    // Handle date_of_issue safely, check type before casting
                    Object dateOfIssueObj = item.get("date_of_issue");
                    Long dateOfIssue = null;
                    if (dateOfIssueObj instanceof Integer) {
                        dateOfIssue = ((Integer) dateOfIssueObj).longValue(); // If it's an Integer, convert it to Long
                    } else if (dateOfIssueObj instanceof Long) {
                        dateOfIssue = (Long) dateOfIssueObj; // If it's already a Long, use it directly
                    }

                    if (dateOfIssue != null) {
                        // Convert date from Unix timestamp to LocalDate
                        LocalDate certificateIssueDate = LocalDateTime.ofEpochSecond(dateOfIssue, 0, java.time.ZoneOffset.UTC).toLocalDate();

                        // Update the student's IELTS status
                        student.setIelts(true);
                        student.setIeltsText("Sertifikat raqami: " + certificateNumber +
                                " Sertifikat turi: " + certificateName.get("name") +
                                " Sertifikat darajasi: " + certificateGrade.get("name"));
                        student.setEndDate(certificateIssueDate);
                    }
                }

                // Save the updated student once all certificates are processed
                studentRepo.save(student);
            }
        }
        return ResponseEntity.ok("Certificates updated successfully");
    }



    @PutMapping("/parents-phone/{studentId}")
    public HttpEntity<?> postParentsPhone(@PathVariable UUID studentId, @RequestBody StudentDTO studentDTO){
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Student student = byId.get();
        if (studentDTO.getFatherPhone() != null) {
            student.setFatherPhone(studentDTO.getFatherPhone());
        }

        if (studentDTO.getMotherPhone() != null) {
            student.setMotherPhone(studentDTO.getMotherPhone());
        }
        studentRepo.save(student);
        return ResponseEntity.ok("saved ");
    }

}
