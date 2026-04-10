package com.example.backend.Controller;

import com.example.backend.Entity.Contract;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.ContractRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/hisobot-old")
public class HisobotOld {

    private final GroupsRepo groupsRepo;
    private final StudentRepo studentRepo;
    private final ContractRepo contractRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportHisobotToExcel() {
        System.out.println("📊 [START] Yo‘nalishlar bo‘yicha umumiy va guruhlar hisobotini yaratish boshlandi...");

        try (Workbook workbook = new XSSFWorkbook()) {
            List<Groups> allGroups = new ArrayList<>();
            try {
                allGroups = groupsRepo.findAllByLevel();
                System.out.println("✅ Guruhlar soni: " + allGroups.size());
            } catch (Exception e) {
                System.out.println("❌ Guruhlarni olishda xatolik: " + e.getMessage());
            }

            // ✅ 1. Create main summary sheet (Umumiy hisobot)
            Sheet summarySheet = workbook.createSheet("Umumiy yo‘nalish hisobot");
            Row summaryHeader = summarySheet.createRow(0);
            String[] headers = {"T/r", "Ta’lim yo‘nalishi", "Yo‘nalish bo‘yicha talabar soni", "Kontrakt to‘lagani", "Kontrakt to‘lamagani"};
            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            style.setFont(font);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = summaryHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(style);
            }

            Map<String, Sheet> sheetMap = new HashMap<>();
            Map<String, DirectionSummary> directionMap = new LinkedHashMap<>();

            // ✅ 2. Build per-group sheets and collect summary stats
            for (Groups group : allGroups) {
                try {
                    List<Student> students = studentRepo.findAllByGroupId(group.getId());
                    String directionName = group.getName();

                    // Aggregate by direction
                    DirectionSummary summary = directionMap.computeIfAbsent(directionName, k -> new DirectionSummary());

                    for (Student student : students) {
                        Contract contract = null;
                        try {
                            Long hemisId = Long.parseLong(student.getStudentIdNumber());
                            contract = contractRepo.findByHemisId(hemisId);
                        } catch (Exception ignored) {}

                        summary.total++;

                        if (contract != null && contract.getPayment() != null && contract.getPayment() > 0) {
                            summary.paid++;
                        } else {
                            summary.unpaid++;
                        }
                    }

                    // ✅ 3. Create per-group detail sheet (as before)
                    List<Student> groupStudents = studentRepo.findAllByGroupId(group.getId());
                    System.out.println("\n📁 Guruh: " + group.getName() + " | Talabalar: " + groupStudents.size());

                    String groupSheetName = sanitizeSheetName(group.getName());
                    Sheet groupSheet = sheetMap.computeIfAbsent(groupSheetName, k -> {
                        Sheet s = workbook.createSheet(k);
                        createGroupHeader(workbook, s);
                        return s;
                    });

                    int rowIndex = groupSheet.getLastRowNum() + 1;
                    int number = 1;

                    for (Student student : groupStudents) {
                        Contract contract = null;
                        try {
                            Long hemisId = Long.parseLong(student.getStudentIdNumber());
                            contract = contractRepo.findByHemisId(hemisId);
                        } catch (Exception ignored) {}

                        String agentName = "";
                        String createdAt = "-";
                        String paymentAgent = "-";

                        try {
                            if (contract != null && contract.getPassportNumber() != null) {
                                String url = "https://qabul.bxu.uz/api/v1/abuturient/student/" + contract.getPassportNumber();
                                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                                    Map<String, Object> body = response.getBody();
                                    Object agentObj = body.get("agent");
                                    agentName = (agentObj == null)
                                            ? ""
                                            : ((Map<String, Object>) agentObj).getOrDefault("name", "").toString();
                                    createdAt = (String) body.getOrDefault("createdAt", "-");
                                    paymentAgent = body.get("amount") != null ? body.get("amount").toString() : "-";
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("❌ API xatolik: " + e.getMessage());
                        }

                        // 🟩 Apply your BXU/Instagram → Behruz Target logic
                        String finalAgentName = "Buxoro xalqaro universiteti";
                        try {
                            if (
                                    agentName.equalsIgnoreCase("BXU") ||
                                            agentName.equalsIgnoreCase("Instagram") ||
                                            agentName.equalsIgnoreCase("Behruz Target") ||
                                            agentName.isBlank()
                            ) {
                                if (!createdAt.equals("-")) {
                                    LocalDate date = LocalDate.parse(createdAt.split("T")[0]);
                                    LocalDate cutoff = LocalDate.of(2025, 7, 12);
                                    if (date.isAfter(cutoff)) {
                                        finalAgentName = "Behruz Target";
                                    }
                                }
                            } else {
                                finalAgentName = agentName;
                            }
                        } catch (Exception e) {
                            System.out.println("⚠️ Sana parse xatolik: " + e.getMessage());
                        }
                        String passportNumber = contract.getPassportNumber();
                        String discount = "-";

//                        try {
//                            // 🔹 Build the request URL
//                            String url = "https://edu.bxu.uz/api/v1/discount-student/" + passportNumber;
//
//                            // 🔹 Make the REST call
//                            RestTemplate restTemplate = new RestTemplate();
//                            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
//
//                            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                                Map<String, Object> body = response.getBody();
//
//                                // "discountByYear" may come as a List of maps
//                                Object discountListObj = body.get("discountByYear");
//
//                                if (discountListObj instanceof List<?>) {
//                                    List<?> discountList = (List<?>) discountListObj;
//                                    StringBuilder sb = new StringBuilder();
//
//                                    for (Object obj : discountList) {
//                                        if (obj instanceof Map<?, ?> discountItem) {
//                                            String name = (String) discountItem.get("name");
//                                            Object discountValue = discountItem.get("discount");
//
//                                            if (sb.length() > 0) sb.append("; ");
//                                            sb.append(name)
//                                                    .append(": ")
//                                                    .append(discountValue);
//                                        }
//                                    }
//
//                                    discount = sb.toString();
//                                }
//                            } else {
//                                System.out.println("⚠️ No data found for passport: " + passportNumber);
//                            }
//
//                        } catch (Exception e) {
//                            e.printStackTrace();
//            System.out.println("❌ Error fetching discount info: " + e.getMessage());
//                        }


                        Row row = groupSheet.createRow(rowIndex++);
                        int col = 0;
                        row.createCell(col++).setCellValue(number++);
                        row.createCell(col++).setCellValue(contract != null ? contract.getFullName() : student.getFullName());
                        row.createCell(col++).setCellValue(student.getGroupName());
                        row.createCell(col++).setCellValue(contract != null ? nonNull(contract.getPassportNumber()) : "-");
                        row.createCell(col++).setCellValue(contract != null && contract.getAmount() != null ? contract.getAmount() : 0);
                        row.createCell(col++).setCellValue(contract != null && contract.getPayment() != null ? contract.getPayment() : 0);
                        row.createCell(col++).setCellValue(contract != null && contract.getDebt() != null ? contract.getDebt() : 0);
                        row.createCell(col++).setCellValue(contract != null && contract.getExtra() != null ? contract.getExtra() : 0);
                        row.createCell(col++).setCellValue(contract != null && contract.getHemisId() != null ? contract.getHemisId() : 0);
                        row.createCell(col++).setCellValue(finalAgentName);
                        row.createCell(col++).setCellValue(paymentAgent);
                        row.createCell(col++).setCellValue(createdAt);
                        row.createCell(col++).setCellValue(discount);
                    }

                    for (int i = 0; i < 12; i++) groupSheet.autoSizeColumn(i);

                } catch (Exception e) {
                    System.out.println("❌ Guruhda xatolik: " + e.getMessage());
                }
            }

            // ✅ 4. Write summary data
            int index = 1;
            int rowIndex = 1;
            for (Map.Entry<String, DirectionSummary> entry : directionMap.entrySet()) {
                DirectionSummary s = entry.getValue();
                Row row = summarySheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(index++);
                row.createCell(1).setCellValue(entry.getKey());
                row.createCell(2).setCellValue(s.total);
                row.createCell(3).setCellValue(s.paid);
                row.createCell(4).setCellValue(s.unpaid);
            }

            for (int i = 0; i < headers.length; i++) summarySheet.autoSizeColumn(i);

            // ✅ 5. Return Excel file
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            workbook.write(output);
            String fileName = "Hisobot_Yonalishlar_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".xlsx";
            System.out.println("🎯 [FINISH] Yo‘nalishlar va guruhlar bo‘yicha hisobot tayyor!");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(output.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(("❌ Xatolik: " + e.getMessage()).getBytes());
        }
    }

    // Helper class to track totals
    static class DirectionSummary {
        int total = 0;
        int paid = 0;
        int unpaid = 0;
    }


    // ----------------------------------------------------------



    private String nonNull(String value) {
        return value != null && !value.trim().isEmpty() ? value : "-";
    }






    // ----------------------------------------------------------
    // ✅ HELPERS
    // ----------------------------------------------------------
    private void createGroupHeader(Workbook workbook, Sheet sheet) {
        Row header = sheet.createRow(0);
        String[] headers = {
                "№", "F.I.Sh. (Contract)", "Gruhi", "Passport",
                "Kontrakt", "To‘lov", "Qarz", "Qo‘shimcha",
                "Hemis ID", "Agent", "To‘lov Agent", "Qabulda sana", "Imtiyoz"
        };
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }



    private String sanitizeSheetName(String name) {
        if (name == null || name.isBlank()) return "Unnamed";
        String cleaned = name.replaceAll("[\\\\/?*\\[\\]:']", "").trim();
        if (cleaned.length() > 31) cleaned = cleaned.substring(0, 31);
        return cleaned.isEmpty() ? "Sheet" : cleaned;
    }









}
