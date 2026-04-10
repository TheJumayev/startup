package com.example.backend.Controller;

import com.example.backend.DTO.GroupStudentResponseDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/exam")
public class ExamController {
    private final ContractFileRepo contractFileRepo;
    private final AttachmentRepo attachmentRepo;
    private final ExamRepo examRepo;
    private final GroupsRepo groupsRepo;
    private final RestTemplate restTemplate;
    private final TokenHemisRepo tokenHemisRepo;
    private final StudentRepo studentRepo;
    private final String baseUrl = "https://student.buxpxti.uz/rest";
    private final ContractRepo contractAmountRepo;
    private final ContractAmountRepo contractAmountRepo2;
    private final GroupStudentRepo groupStudentRepo;
    @GetMapping("/{groupId}")
    public HttpEntity<?> getExamByGroupId(@PathVariable UUID groupId) {
        List<Exam> exams = examRepo.findAllByGroupId(groupId);
        return  ResponseEntity.ok(exams);

    }
    @GetMapping("/update/{groupId}")
    public HttpEntity<?> postAllExams(@PathVariable UUID groupId) {
        Groups group = groupsRepo.findById(groupId).orElse(null);
        if (group == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
        }

        String apiUrl = "https://student.buxpxti.uz/rest/v1/data/exam-list?_group=" + group.getHemisId();
        int page = 1;
        int allPages = 2;

        List<TokenHemis> all = tokenHemisRepo.findAll();
        if (all.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No token found");
        }

        TokenHemis tokenHemis = all.get(all.size() - 1);
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenHemis.getName());
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        try {
            while (page <= allPages) {
                String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                        .queryParam("page", page)
                        .toUriString();

                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                    for (Map<String, Object> examData : items) {
                        List<Map<String, Object>> examGroups = (List<Map<String, Object>>) examData.get("examGroups");
                        Long startAt = null;
                        Long finishAt = null;
                        if (examGroups != null && !examGroups.isEmpty()) {
                            Map<String, Object> firstExamGroup = examGroups.get(0); // Birinchi guruhni olish
                            if (firstExamGroup.containsKey("start_at") && firstExamGroup.get("start_at") != null) {
                                startAt = ((Number) firstExamGroup.get("start_at")).longValue();
                            }
                            if (firstExamGroup.containsKey("finish_at") && firstExamGroup.get("finish_at") != null) {
                                finishAt = ((Number) firstExamGroup.get("finish_at")).longValue();
                            }
                        }
                        if (startAt == null && examData.containsKey("start_at")) {
                            startAt = ((Number) examData.get("start_at")).longValue();
                        }
                        if (finishAt == null && examData.containsKey("finish_at")) {
                            finishAt = ((Number) examData.get("finish_at")).longValue();
                        }
                            for (Map<String, Object> examGroup : examGroups) {
                                Map<String, Object> groupData = (Map<String, Object>) examGroup.get("group");
                                Integer groupHemisId = (Integer) groupData.get("id");
                                Groups dbGroup = groupsRepo.findGroupByHemisId(groupHemisId);
                                if (examRepo.findByHemisIdAndGrooupId((Integer) examData.get("id"), dbGroup.getId()).size()==0) {
                                    Exam exam = new Exam(
                                            (Integer) examData.get("id"),
                                            (String) examData.get("name"),
                                            ((Map<String, Object>) examData.get("semester")).get("name").toString(),
                                            (Integer) ((Map<String, Object>) examData.get("semester")).get("id"),
                                            ((Map<String, Object>) examData.get("subject")).get("name").toString(),
                                            (Integer) ((Map<String, Object>) examData.get("subject")).get("id"),
                                            ((Map<String, Object>) examData.get("employee")).get("name").toString(),
                                            (Integer) ((Map<String, Object>) examData.get("employee")).get("id"),
                                            dbGroup, // use the group we found in our database
                                            (Integer) examData.get("question_count"),
                                            (Integer) examData.get("duration"),
                                            (Integer) examData.get("max_ball"),
                                            startAt != null ? LocalDateTime.ofEpochSecond(startAt, 0, java.time.ZoneOffset.UTC) : null,
                                            (Integer) examData.get("attempts"),
                                            finishAt != null ? LocalDateTime.ofEpochSecond(finishAt, 0, java.time.ZoneOffset.UTC) : null,
                                            LocalDateTime.now()
                                    );

                                    examRepo.save(exam);
                                }
                            }


                    }

                    page++;
                } else {
                    break;
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred while saving exams: " + e.getMessage());
        }

        List<Exam> allByGroupId = examRepo.findAllByGroupId(groupId);
        return ResponseEntity.ok(allByGroupId);
    }


    @GetMapping("/start/{examId}/{acload}")
    public HttpEntity<?> startExam(@PathVariable UUID examId, @PathVariable Integer acload) {
        Exam exam = (Exam) examRepo.findById(examId).orElse(null);
        if (exam == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
        }

        exam.setAcload(acload);
        examRepo.save(exam);
        Groups group = exam.getGroup();
        List<Student> students = studentRepo.findAllByGroupId(group.getId());
        Integer subjectId = exam.getSubjectId();
        List<GroupStudentResponseDTO> groupStudentResponseDTOS = new ArrayList<>();
        for (Student student : students) {
            GroupStudentResponseDTO groupStudentResponseDTO = new GroupStudentResponseDTO();
            groupStudentResponseDTO.setStudent(student);
            String attendance = getAttendanceStudentString(subjectId, student.getHemisId());
            groupStudentResponseDTO.setAttendance(attendance);
            Boolean isAttendance = getAttendanceStudentBoolean(subjectId, student.getHemisId(), exam.getAcload());
            groupStudentResponseDTO.setIsAttendance(isAttendance);
            System.out.println(student.getStudentIdNumber());

            Contract contract = new Contract();
            try{
                 contract = contractAmountRepo.findByHemisId(parseLong(student.getStudentIdNumber()));
            }catch(HttpClientErrorException e){
                continue;
            }


            String contractString ="";
            if (contract == null) {
                groupStudentResponseDTO.setContract("Kontrakt ma'lumotlari topilmadi");
                contractString = "Kontrakt topilmadi";
                groupStudentResponseDTO.setIsContract(false);
                groupStudentResponseDTOS.add(groupStudentResponseDTO);
                continue;
            }
            String information = "Sizning kontraktingiz: " + contract.getAmount() +
                    ", To'lovingiz: " + contract.getPayment() +
                    ", Qarzingiz: " + contract.getDebt() +
                    ", Ortiqcha to'lovingiz: " + contract.getExtra();
            contractString=information;
            groupStudentResponseDTO.setContract(information);
            List<ContractAmount> allContractAmounts = contractAmountRepo2.findAll();
            Boolean isContract = false;
            if (allContractAmounts.isEmpty()) {
                groupStudentResponseDTO.setIsContract(isContract);
                groupStudentResponseDTOS.add(groupStudentResponseDTO);
                continue;
            }

            ContractAmount contractAmount = allContractAmounts.get(allContractAmounts.size() - 1);
            Integer contractAmountInPercentage = contractAmount.getAmount();

            if (contract.getAmount() == null || contract.getAmount() == 0) {
                System.out.println("------------------------------------------------------");
                groupStudentResponseDTO.setIsContract(isContract);
            } else {
                double paidPercentage = 100.0 * (contract.getAmount() - contract.getDebt()) / contract.getAmount();
                isContract = paidPercentage >= contractAmountInPercentage;
                groupStudentResponseDTO.setIsContract(isContract);
            }

            String grade = getGradeString(exam.getSemesterName(), student.getHemisId(), exam.getSubjectId());
            groupStudentResponseDTO.setGrade(grade);
            Boolean isGrade = getGradeBoolean(exam.getSemesterName(), student.getHemisId(), exam.getSubjectId());
            groupStudentResponseDTO.setIsGrade(isGrade);
            GroupStudent groupStudent = new GroupStudent(student, attendance, isAttendance, grade, isGrade, contractString, isContract, exam, LocalDateTime.now());
            GroupStudent save = groupStudentRepo.save(groupStudent);
            groupStudentResponseDTOS.add(groupStudentResponseDTO);

//            if(isGrade && isContract && isAttendance){
//                String pathToSaveFile = "rasm/";
//                Attachment imageFile = student.getImage_file();
//
//                if(imageFile == null) {
//                    System.out.println("No image file found for student: " + student.getId());
//                    continue;
//                }
//
//                try {
//                    // Source file path
//                    String sourceFilePath = "backend/files/" + imageFile.getPrefix() + "/" + imageFile.getName();
//                    File sourceFile = new File(sourceFilePath);
//
//                    if(!sourceFile.exists()) {
//                        System.out.println("Source file not found: " + sourceFilePath);
//                        continue;
//                    }
//
//                    // Create target directory if it doesn't exist
//                    File targetDir = new File(pathToSaveFile);
//                    if (!targetDir.exists() && !targetDir.mkdirs()) {
//                        System.out.println("Failed to create target directory: " + pathToSaveFile);
//                        continue;
//                    }
//
//                    String destinationFileName =  imageFile.getName();
//                    String destinationFilePath = pathToSaveFile  + destinationFileName;
//                    File destinationFile = new File(destinationFilePath);
//
//                    try (InputStream in = new FileInputStream(sourceFile);
//                         OutputStream out = new FileOutputStream(destinationFile)) {
//                        byte[] buffer = new byte[1024];
//                        int length;
//                        while ((length = in.read(buffer)) > 0) {
//                            out.write(buffer, 0, length);
//                        }
//                    }
//
//                    System.out.println("Image copied successfully for student " + student.getId() +
//                            " to: " + destinationFilePath);
//
//                } catch (IOException e) {
//                    System.err.println("Error copying image for student " + student.getId() +
//                            ": " + e.getMessage());
//                    e.printStackTrace();
//                }
//            }
        }
        return ResponseEntity.ok(groupStudentResponseDTOS);
    }


    @GetMapping("/student-status/{examId}/{studentId}")
    public HttpEntity<?> studentStatus(@PathVariable UUID examId, @PathVariable UUID studentId) {
        Exam exam = examRepo.findById(examId).orElse(null);
        if (exam == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
        }
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }
        Integer subjectId = exam.getSubjectId();
        GroupStudentResponseDTO groupStudentResponseDTO = new GroupStudentResponseDTO();
        groupStudentResponseDTO.setStudent(student);
        groupStudentResponseDTO.setAttendance(getAttendanceStudentString(subjectId, student.getHemisId()));
        groupStudentResponseDTO.setIsAttendance(getAttendanceStudentBoolean(subjectId, student.getHemisId(), exam.getAcload()));
        Contract contract = contractAmountRepo.findByHemisId(parseLong(student.getStudentIdNumber()));
        if (contract == null) {
            groupStudentResponseDTO.setContract("Kontrakt ma'lumotlari topilmadi");
            groupStudentResponseDTO.setIsContract(false);
        }else{
            Integer amount = contract.getAmount();
            Integer debt = contract.getDebt();
            String information = "Sizning kontraktingiz: " + amount+
                    ", To'lovingiz: " + contract.getPayment() +
                    ", Qarzingiz: " + debt +
                    ", Ortiqcha to'lovingiz: " + contract.getExtra();
            groupStudentResponseDTO.setContract(information);
            List<Contract> allContractAmounts = contractAmountRepo.findAll();
            Contract contractAmount = allContractAmounts.get(allContractAmounts.size() - 1);
            Integer contractAmountInPercentage = contractAmount.getAmount();
            if (contract.getAmount() == null || contract.getAmount() == 0) {
                groupStudentResponseDTO.setIsContract(false);
            } else {
                double paidPercentage = 100.0 * (contract.getAmount() - contract.getDebt()) / contract.getAmount();
                groupStudentResponseDTO.setIsContract(paidPercentage >= contractAmountInPercentage);
            }

        }


        groupStudentResponseDTO.setGrade(getGradeString(exam.getSemesterName(), student.getHemisId(), exam.getSubjectId()));
        groupStudentResponseDTO.setIsGrade(getGradeBoolean(exam.getSemesterName(), student.getHemisId(), exam.getSubjectId()));



        List<Contract> allContractAmounts = contractAmountRepo.findAll();
        if (allContractAmounts.isEmpty()) {
            groupStudentResponseDTO.setIsContract(false);
        }
        return ResponseEntity.ok(groupStudentResponseDTO);
    }



    private Boolean getAttendanceStudentBoolean(Integer subjectId, Integer hemisId, Integer acload) {
        String url = baseUrl + "/v1/data/attendance-list?_subject=" + subjectId + "&_student=" + hemisId;
        HttpHeaders headers = new HttpHeaders();
        List<TokenHemis> all = tokenHemisRepo.findAll();
        TokenHemis tokenHemis = all.get(all.size() - 1);
        headers.setBearerAuth(tokenHemis.getName());

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && (Boolean) body.get("success")) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                int sababsizNB = 0; // Sababsiz NB count

                for (Map<String, Object> item : items) {
                    int absentOn = (int) item.get("absent_on");
                    int absentOff = (int) item.get("absent_off");

                    if (absentOn == 0) {
                        sababsizNB += absentOff; // Increment sababsizNB count
                    }
                }

                // Return true if sababsizNB count is more than 4
                return sababsizNB < acload;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false; // Xatolik bo‘lsa yoki natija bo‘lmasa false qaytariladi
    }

    private String getAttendanceStudentString(Integer subjectId, Integer hemisId) {
        String url = baseUrl + "/v1/data/attendance-list?_subject=" + subjectId + "&_student=" + hemisId;
        HttpHeaders headers = new HttpHeaders();
        List<TokenHemis> all = tokenHemisRepo.findAll();
        TokenHemis tokenHemis = all.get(all.size() - 1);
        headers.setBearerAuth(tokenHemis.getName());

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
            Map<String, Object> body = response.getBody();
            System.out.println(body);
            if (body != null && (Boolean) body.get("success")) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                int totalNB = 0;
                int sababliNB = 0;
                int sababsizNB = 0;

                Map<String, Integer> sababliByTrainingType = new HashMap<>();
                Map<String, Integer> sababsizByTrainingType = new HashMap<>();

                for (Map<String, Object> item : items) {
                    String trainingTypeName = ((Map<String, Object>) item.get("trainingType")).get("name").toString();
                    int absentOn = (int) item.get("absent_on");
                    int absentOff = (int) item.get("absent_off");

                    totalNB += absentOff;

                    if (absentOn > 0) {
                        sababliNB += absentOff;
                        sababliByTrainingType.put(trainingTypeName, sababliByTrainingType.getOrDefault(trainingTypeName, 0) + absentOff);
                    } else {
                        sababsizNB += absentOff;
                        sababsizByTrainingType.put(trainingTypeName, sababsizByTrainingType.getOrDefault(trainingTypeName, 0) + absentOff);
                    }
                }

                // **Building the result string conditionally**
                StringBuilder result = new StringBuilder();
                result.append("Umumiy NB soni: ").append(totalNB).append("\n");

                if (sababliNB > 0) {
                    result.append("Sababli NB soni: ").append(sababliNB).append("\n");
                }

                if (sababsizNB > 0) {
                    result.append("Sababsiz NB soni: ").append(sababsizNB).append("\n");
                }

                if (!sababliByTrainingType.isEmpty()) {
                    result.append("\nSababli NB soni:\n");
                    for (Map.Entry<String, Integer> entry : sababliByTrainingType.entrySet()) {
                        result.append(entry.getKey()).append(": ").append(entry.getValue()).append(" NB\n");
                    }
                }

                if (!sababsizByTrainingType.isEmpty()) {
                    result.append("\nSababsiz NB soni:\n");
                    for (Map.Entry<String, Integer> entry : sababsizByTrainingType.entrySet()) {
                        result.append(entry.getKey()).append(": ").append(entry.getValue()).append(" NB\n");
                    }
                }

                return result.toString().trim(); // Trim to remove any trailing new lines
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "No data available"; // Return default message if there's an error or no data
    }

    private Boolean getGradeBoolean(String semester, Integer hemisId, Integer subjectId) {
        int maxRetries = 3;
        int retryCount = 0;
        long delayBetweenRetries = 1000; // 1 second
//        if (hemisId==1564 || hemisId==4527 || hemisId==1338 || hemisId==1529 || hemisId==1334 || hemisId==1515 || hemisId==1607 || hemisId==1312) {
//            return false;
//        }
        while (retryCount < maxRetries) {
            try {
                // Convert semester string to number (e.g., "6-semestr" -> 16)
                Integer semesterNumber = 10 + Integer.parseInt(semester.split("-")[0]);

                String url = baseUrl + "/v1/data/student-performance-list?_semester=" + semesterNumber + "&_student=" + hemisId+ "&limit=200";

                HttpHeaders headers = new HttpHeaders();
                List<TokenHemis> all = tokenHemisRepo.findAll();
                if (all.isEmpty()) {
                    return false;
                }
                TokenHemis tokenHemis = all.get(all.size() - 1);
                headers.setBearerAuth(tokenHemis.getName());
                headers.set("Accept", "application/json");

                HttpEntity<?> requestEntity = new HttpEntity<>(headers);

                try {
                    // Add delay before request
                    if (retryCount > 0) {
                        Thread.sleep(delayBetweenRetries * retryCount);
                    }

                    ResponseEntity<Map> response = restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            requestEntity,
                            Map.class
                    );

                    Map<String, Object> body = response.getBody();
                    if (body != null && Boolean.TRUE.equals(body.get("success"))) {
                        Map<String, Object> data = (Map<String, Object>) body.get("data");
                        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                        int totalGrade = 0;

                        for (Map<String, Object> item : items) {
                            Map<String, Object> subject = (Map<String, Object>) item.get("subject");
                            if (subject != null) {
                                Integer currentSubjectId = (Integer) subject.get("id");
                                if (currentSubjectId != null && currentSubjectId.equals(subjectId)) {
                                    Number grade = (Number) item.get("grade");
                                    if (grade != null) {
                                        totalGrade += grade.intValue();
                                    }
                                }
                            }
                        }

                        return totalGrade >= 30;
                    }
                } catch (HttpClientErrorException.TooManyRequests e) {
                    retryCount++;
                    continue;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                } catch (Exception e) {
                    return false;
                }
            } catch (NumberFormatException e) {
                return false;
            }
        }
        return false;
    }

    private String getGradeString(String semester, Integer hemisId, Integer subjectId) {
        int maxRetries = 3;
        int retryCount = 0;
        long delayBetweenRetries = 1000; // 1 second
        System.out.printf("Semester: %s\n", semester);
        while (retryCount < maxRetries) {
            try {
                // Convert semester string to number (e.g., "6-semestr" -> 16)
                Integer semesterNumber = 10 + Integer.parseInt(semester.split("-")[0]);

                String url = baseUrl + "/v1/data/student-performance-list?_semester=" + semesterNumber + "&_student=" + hemisId+ "&limit=200";
                System.out.printf("getGradeString: %s\n", url);
                HttpHeaders headers = new HttpHeaders();
                List<TokenHemis> all = tokenHemisRepo.findAll();
                if (all.isEmpty()) {
                    return "Token topilmadi";
                }
                TokenHemis tokenHemis = all.get(all.size() - 1);
                headers.setBearerAuth(tokenHemis.getName());
                headers.set("Accept", "application/json");

                HttpEntity<?> requestEntity = new HttpEntity<>(headers);

                try {
                    // Add delay before request
                    if (retryCount > 0) {
                        Thread.sleep(delayBetweenRetries * retryCount);
                    }

                    ResponseEntity<Map> response = restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            requestEntity,
                            Map.class
                    );

                    Map<String, Object> body = response.getBody();
                    System.out.printf("grade is here");
                    System.out.printf("getGradeString: %s\n", body);


                    if (body != null && Boolean.TRUE.equals(body.get("success"))) {
                        Map<String, Object> data = (Map<String, Object>) body.get("data");
                        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                        StringBuilder result = new StringBuilder();
                        boolean found = false;
                        for (Map<String, Object> item : items) {
                           Map<String, Object> subject = (Map<String, Object>) item.get("subject");
                            if (subject != null) {
                                Integer currentSubjectId = (Integer) subject.get("id");
                                if (currentSubjectId != null && currentSubjectId.equals(subjectId)) {

                                    System.out.print(subject);
                                    System.out.printf("%s: %s\n", subject.get("name"), subject.get("grade"));
                                    found = true;
                                    Map<String, Object> examType = (Map<String, Object>) item.get("examType");
                                    String examTypeName = examType != null ? (String) examType.get("name") : "Noma'lum";
                                    Number grade = (Number) item.get("grade");

                                    result.append(examTypeName)
                                            .append(": ")
                                            .append(grade != null ? grade : "0")
                                            .append("\n");
                                }
                            }
                        }

                        return found ? result.toString().trim() : "Oraliq nazorat mavjud emas.";
                    } else if (body != null && body.containsKey("error")) {
                        return "Xato: " + body.get("error");
                    }
                } catch (HttpClientErrorException.TooManyRequests e) {
                    retryCount++;
                    continue;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return "Baholarni olishda xatolik yuz berdi";
                } catch (Exception e) {
                    return "Baholarni olishda xatolik yuz berdi";
                }
            } catch (NumberFormatException e) {
                return "Baholarni olishda xatolik yuz berdi";
            }
        }
        return "Serverga ko'p so'rovlar yuborilgan. Iltimos, biroz kutib turing.";
    }
    private Long parseLong(Object value) {
        if (value == null) return null;
        try {
            String strValue = value.toString().trim();
            if (strValue.isEmpty()) return null; // Bo‘sh qiymatlarni null qilib yuborish
            return Long.parseLong(strValue); // To‘g‘ridan-to‘g‘ri Long ga o‘tkazish
        } catch (NumberFormatException e) {
            return null; // Agar xatolik bo‘lsa, null qaytarish
        }
    }








}