//package com.example.backend.Controller;
//
//import com.example.backend.Entity.*;
//import com.example.backend.Repository.ContractRepo;
//import com.example.backend.Repository.DiscountStudentRepo;
//import com.example.backend.Repository.GroupsRepo;
//import com.example.backend.Repository.StudentRepo;
//import lombok.RequiredArgsConstructor;
//import org.apache.poi.ss.usermodel.*;
//import org.apache.poi.xssf.usermodel.XSSFWorkbook;
//import org.springframework.http.*;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.client.RestTemplate;
//
//import java.io.ByteArrayOutputStream;
//import java.io.IOException;
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//import java.util.*;
//
//@RestController
//@RequiredArgsConstructor
//@CrossOrigin
//@RequestMapping("/api/v1/hisobot")
//public class HisobotOldController {
//
//    private final GroupsRepo groupsRepo;
//    private final StudentRepo studentRepo;
//    private final ContractRepo contractRepo;
//    private final DiscountStudentRepo discountStudentRepo;
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    private static final double MIN_PAYMENT_PERCENT = 25.0;
//
//    // ==================== 🔹 AGENT STATISTIC EXCEL EXPORT ==================== //
//    @GetMapping("/agent-statistic")
//    public ResponseEntity<byte[]> exportAgentStatisticExcel() {
//        System.out.println("📊 [START] Agentlar bo‘yicha umumiy va batafsil hisobot yaratish boshlandi...");
//        try (Workbook workbook = new XSSFWorkbook()) {
//            Sheet summarySheet = workbook.createSheet("Umumiy hisobot");
//            Row header = summarySheet.createRow(0);
//            String[] headers = {"T/r", "Agent nomi", "Soni", "To‘lov qilgan soni", "To‘lov qilmagan soni", "Agentga mukofoti"};
//            // Header style
//            CellStyle headerStyle = workbook.createCellStyle();
//            Font headerFont = workbook.createFont();
//            headerFont.setBold(true);
//            headerStyle.setFont(headerFont);
//
//            for (int i = 0; i < headers.length; i++) {
//                Cell cell = header.createCell(i);
//                cell.setCellValue(headers[i]);
//                cell.setCellStyle(headerStyle);
//            }
//
//            Map<String, Sheet> sheetMap = new HashMap<>();
//            Map<String, AgentSummary> agentStats = new HashMap<>();
//
//            List<Groups> allGroups = groupsRepo.findAllByLevel();
//            for (Groups group : allGroups) {
//                List<Student> students = studentRepo.findAllByGroupId(group.getId());
//                for (Student student : students) {
//                    Contract contract = null;
//                    try {
//                        Long hemisId = Long.parseLong(student.getStudentIdNumber());
//                        contract = contractRepo.findByHemisId(hemisId);
//                    } catch (Exception ignored) {}
//
//                    if (contract == null) continue;
//
//                    String agentName = "";
//                    String createdAt = "-";
//                    String phone = "-";
//                    String paymentStatus = "To‘lov qilmagan";
//                    double reward = 0.0;
//                    String amountForAgent = "";
//                    String isStudy="";
//                    String studyTime = "";
//                    // 🔹 Get agent info
//                    try {
//                        if (contract.getPassportNumber() != null) {
//
//
//
//                            String url = "https://qabul.bxu.uz/api/v1/abuturient/student/"
//                                    + contract.getPassportNumber();
//
//                            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
//
//
//                            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
//                                Map<String, Object> body = response.getBody();
//
//                                Object agentObj = body.get("agent");
//                                agentName = (agentObj == null)
//                                        ? ""
//                                        : ((Map<String, Object>) agentObj).getOrDefault("name", "").toString();
//
//
//                                createdAt = (String) body.getOrDefault("createdAt", "-");
//                                String amountStr = body.get("amount") != null ? body.get("amount").toString() : "0";
//                                phone = (String) body.get("phone");
//                                amountForAgent = amountStr;
//                                isStudy = body.get("isStudy").toString();
//                                if (isStudy != null) {
//                                    if(isStudy.equals("0")){
//                                        isStudy="O'qimaydi";
//                                        studyTime = (String) body.getOrDefault("isStudyUpdatedAt", "-");
//                                    }
//                                }
//
//                                try {
//                                    reward = Double.parseDouble(amountStr);
//                                } catch (NumberFormatException ignored) {}
//                            }
//                        }
//                    } catch (Exception e) {
////                        System.out.println("bug-------"+contract.getPassportNumber());
////                        System.out.println("⚠️ API xatolik: " + e.getMessage());
//                    }
//
//
//                    // 🟩 Agent name fallback
//                    String finalAgentName = agentName;
//                    try {
//                        if (
//                                agentName.equalsIgnoreCase("BXU") ||
//                                        agentName.equalsIgnoreCase("Instagram") ||
//                                        agentName.equalsIgnoreCase("Behruz Target") ||
//                                        agentName.isBlank()
//                        ) {
//                            if (!createdAt.equals("-")) {
//                                LocalDate date = LocalDate.parse(createdAt.split("T")[0]);
//                                LocalDate cutoff = LocalDate.of(2025, 7, 1);
//                                if (date.isAfter(cutoff)) {
//                                    finalAgentName = "Behruz Target";
//                                } else {
//                                    finalAgentName = "Buxoro xalqaro universiteti";
//                                }
//                            } else {
//                                finalAgentName = "Buxoro xalqaro universiteti";
//                            }
//                        }
//                    } catch (Exception e) {
//                        System.out.println("⚠️ Sana parse xatolik: " + e.getMessage());
//                        finalAgentName = "Buxoro xalqaro universiteti";
//                    }
//
//                    if (amountForAgent.isEmpty()) paymentStatus = "-";
//                    else paymentStatus = amountForAgent;
//
//                    // ✅ Update summary stats
//                    AgentSummary stat = agentStats.computeIfAbsent(finalAgentName, k -> new AgentSummary());
//                    stat.total++;
//                    if (contract.getPayment() != null && contract.getPayment() > 0) {
//                        stat.paid++;
//                        stat.totalReward += reward;
//                    } else {
//                        stat.unpaid++;
//                    }
//
//                    // ✅ Write to agent-specific sheet
//                    writeAgentRow(workbook, sheetMap, finalAgentName, contract, student, paymentStatus, createdAt, phone, isStudy, studyTime);
//                }
//            }
//
//            // ✅ Fill Umumiy hisobot
//            int index = 1;
//            int rowIndex = 1;
//            for (Map.Entry<String, AgentSummary> entry : agentStats.entrySet()) {
//                AgentSummary s = entry.getValue();
//                Row row = summarySheet.createRow(rowIndex++);
//                row.createCell(0).setCellValue(index++);
//                row.createCell(1).setCellValue(entry.getKey());
//                row.createCell(2).setCellValue(s.total);
//                row.createCell(3).setCellValue(s.paid);
//                row.createCell(4).setCellValue(s.unpaid);
//                row.createCell(5).setCellValue(s.totalReward);
//            }
//
//            // ✅ Add total row at the end of Umumiy hisobot
//            int summaryLastRow = summarySheet.getLastRowNum() + 2;
//            Row totalRow = summarySheet.createRow(summaryLastRow);
//            CellStyle boldStyle = workbook.createCellStyle();
//            Font boldFont = workbook.createFont();
//            boldFont.setBold(true);
//            boldStyle.setFont(boldFont);
//            boldStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
//            boldStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
//
//            totalRow.createCell(0).setCellValue("JAMI HISOB:");
//            totalRow.getCell(0).setCellStyle(boldStyle);
//            totalRow.createCell(2).setCellFormula(String.format("SUM(C2:C%d)", rowIndex - 1));
//            totalRow.createCell(3).setCellFormula(String.format("SUM(D2:D%d)", rowIndex - 1));
//            totalRow.createCell(4).setCellFormula(String.format("SUM(E2:E%d)", rowIndex - 1));
//            totalRow.createCell(5).setCellFormula(String.format("SUM(F2:F%d)", rowIndex - 1));
//            for (int i = 2; i <= 5; i++) totalRow.getCell(i).setCellStyle(boldStyle);
//
//            // ✅ Auto-size
//            for (int i = 0; i < headers.length; i++) summarySheet.autoSizeColumn(i);
//            for (Sheet sheet : sheetMap.values())
//                for (int i = 0; i < 13; i++) sheet.autoSizeColumn(i);
//
//            // ✅ Add totals & freeze header row for each agent sheet
//            for (Map.Entry<String, Sheet> entry : sheetMap.entrySet()) {
//                Sheet sheet = entry.getValue();
//
//                sheet.createFreezePane(0, 1); // freeze header
//
//                int lastRow = sheet.getLastRowNum();
//                int dataEndRow = lastRow + 1;
//
//                CellStyle agentBold = workbook.createCellStyle();
//                Font f = workbook.createFont();
//                f.setBold(true);
//                agentBold.setFont(f);
//                agentBold.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
//                agentBold.setFillPattern(FillPatternType.SOLID_FOREGROUND);
//
//                // ✅ 1️⃣ JAMI SONI ROW (counts)
//                Row jamiSoniRow = sheet.createRow(dataEndRow + 1);
//                jamiSoniRow.createCell(0).setCellValue("JAMI SONI:");
//                jamiSoniRow.getCell(0).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(4).setCellFormula(String.format("COUNTA(E2:E%d)", dataEndRow)); // Passport count
//                jamiSoniRow.getCell(4).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(5).setCellFormula(String.format("COUNTA(F2:F%d)", dataEndRow)); // Contract count
//                jamiSoniRow.getCell(5).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(6).setCellFormula(String.format("COUNTIF(G2:G%d,\">0\")", dataEndRow)); // Payment > 0
//                jamiSoniRow.getCell(6).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(6).setCellFormula(String.format("COUNTIF(H2:H%d,\">0\")", dataEndRow)); // qoldiq > 0
//                jamiSoniRow.getCell(6).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(9).setCellFormula(String.format("COUNTIF(J2:J%d,\">0\")", dataEndRow)); // % > 25
//                jamiSoniRow.getCell(9).setCellStyle(agentBold);
//
//                jamiSoniRow.createCell(10).setCellFormula(String.format("COUNTIF(K2:K%d,\">0\")", dataEndRow)); // % > 25
//                jamiSoniRow.getCell(10).setCellStyle(agentBold);
//                jamiSoniRow.createCell(12).setCellFormula(String.format("COUNTIF(M2:M%d,\"<>-\")", dataEndRow)); // Imtiyoz count
//                jamiSoniRow.getCell(12).setCellStyle(agentBold);
//
//                // ✅ 2️⃣ JAMI HISOB ROW (sums)
//                // ✅ Create money format (e.g. 69 305 000,00)
//                CellStyle moneyStyle = workbook.createCellStyle();
//                DataFormat format = workbook.createDataFormat();
//                moneyStyle.setDataFormat(format.getFormat("#,##0.00"));
//                Font moneyFont = workbook.createFont();
//                moneyFont.setBold(true);
//                moneyStyle.setFont(moneyFont);
//                moneyStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
//                moneyStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
//
//                Row jamiHisobRow = sheet.createRow(dataEndRow + 2);
//                jamiHisobRow.createCell(0).setCellValue("JAMI HISOB:");
//                jamiHisobRow.getCell(0).setCellStyle(agentBold);
//
//// Kontrakt miqdori (F)
//                jamiHisobRow.createCell(5).setCellFormula(String.format("SUM(F2:F%d)", dataEndRow));
//                jamiHisobRow.getCell(5).setCellStyle(moneyStyle);
//
//// To‘lov qilingan pul (G)
//                jamiHisobRow.createCell(6).setCellFormula(String.format("SUM(G2:G%d)", dataEndRow));
//                jamiHisobRow.getCell(6).setCellStyle(moneyStyle);
//
//// Qoldiq (H)
//                jamiHisobRow.createCell(7).setCellFormula(String.format("SUM(H2:H%d)", dataEndRow));
//                jamiHisobRow.getCell(7).setCellStyle(moneyStyle);
//
//// Agentga berilishi kerak bo‘lgan pul (J)
//                jamiHisobRow.createCell(9).setCellFormula(String.format("SUM(J2:J%d)", dataEndRow));
//                jamiHisobRow.getCell(9).setCellStyle(moneyStyle);
//
//// Agentga berilgan (To‘lov) (K)
//                Cell jamiHisobCell10 = jamiHisobRow.createCell(10);
//                jamiHisobCell10.setCellFormula(String.format("SUMIF(K2:K%d,\">0\",K2:K%d)", dataEndRow, dataEndRow));
//                jamiHisobCell10.setCellStyle(moneyStyle);
//
//
//
//
////                25 %
////                Row jamiSoniRow25 = sheet.createRow(dataEndRow + 3);
////                jamiSoniRow25.createCell(0).setCellValue("JAMI 25%:");
////                jamiSoniRow25.getCell(0).setCellStyle(agentBold);
////
////                Cell cell25 = jamiSoniRow25.createCell(6);
////                cell25.setCellFormula(String.format(
////                        "SUMPRODUCT((F2:F%d<>0)*(G2:G%d/F2:F%d*100>25))",
////                        dataEndRow, dataEndRow, dataEndRow
////                ));
////                cell25.setCellStyle(agentBold);
//
//
//            }
//
//
//            // ✅ Export
//            ByteArrayOutputStream output = new ByteArrayOutputStream();
//            workbook.write(output);
//            String fileName = "Agent_Statistic_" + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".xlsx";
//            System.out.println("🎯 [FINISH] Umumiy va agentlar bo‘yicha hisobot tayyor!");
//
//            return ResponseEntity.ok()
//                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
//                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
//                    .body(output.toByteArray());
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.internalServerError()
//                    .body(("❌ Xatolik: " + e.getMessage()).getBytes());
//        }
//    }
//
//    // ==================== 🔸 HELPER CLASSES & METHODS ==================== //
//    static class AgentSummary {
//        int total = 0;
//        int paid = 0;
//        int unpaid = 0;
//        double totalReward = 0;
//    }
//
//    private void writeAgentRow(Workbook workbook, Map<String, Sheet> sheetMap, String sheetName,
//                               Contract contract, Student student, String paymentStatus, String createdAt, String phone, String isStudy, String studyTime) throws IOException {
//        Sheet sheet = sheetMap.computeIfAbsent(sheetName, k -> {
//            Sheet s = workbook.createSheet(k);
//            createAgentHeader(workbook, s);
//            s.createFreezePane(0, 1); // freeze header row
//            return s;
//        });
//
//        int rowIndex = sheet.getLastRowNum() + 1;
//        Row row = sheet.createRow(rowIndex);
//        int col = 0;
//        String passportNumber = contract.getPassportNumber();
//        String discount = "-";
//        double agentPul = 1_000_000;
//
//        try {
//            String url = "https://edu.bxu.uz/api/v1/discount-student/" + passportNumber;
//            RestTemplate restTemplate = new RestTemplate();
//            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
//
//            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                Map<String, Object> body = response.getBody();
//                Object discountListObj = body.get("discountByYear");
//
//                if (discountListObj instanceof List<?>) {
//                    List<?> discountList = (List<?>) discountListObj;
//                    StringBuilder sb = new StringBuilder();
//
//                    for (Object obj : discountList) {
//                        if (obj instanceof Map<?, ?> discountItem) {
//                            String name = (String) discountItem.get("name");
//                            Object discountValueObj = discountItem.get("discount");
//                            double discountValue = 0;
//                            if (discountValueObj != null) {
//                                try {
//                                    discountValue = Double.parseDouble(discountValueObj.toString());
//                                } catch (Exception ignored) {}
//                            }
//
//                            if (sb.length() > 0) sb.append("; ");
//                            sb.append(name).append(": ").append(discountValue);
//
//                            if ("2025-2026".equals(name)) {
//                                double kontraktAmount = contract != null && contract.getAmount() != null ? contract.getAmount() : 0;
//                                if (kontraktAmount > 0) {
//                                    agentPul = 1_000_000 - (discountValue / kontraktAmount) * 1_000_000;
//                                }
//                            }
//                        }
//                    }
//                    discount = sb.toString();
//                }
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        double kontrakt = contract != null && contract.getAmount() != null ? contract.getAmount() : 0;
//        double tolov = contract != null && contract.getPayment() != null ? contract.getPayment() : 0;
//        double qarz = contract != null && contract.getDebt() != null ? contract.getDebt() : 0;
//        double foiz = (kontrakt > 0) ? (tolov / kontrakt * 100) : 0;
//
//        // 🧠 New rule: if payment percent < 25%, no agent reward
//        if (foiz < MIN_PAYMENT_PERCENT) {
//            agentPul = 0.0;
//        }
//
//        row.createCell(col++).setCellValue(rowIndex);
//        row.createCell(col++).setCellValue(contract != null ? contract.getFullName() : student.getFullName());
//        row.createCell(col++).setCellValue(phone);
//        row.createCell(col++).setCellValue(student.getGroupName());
//        row.createCell(col++).setCellValue(contract != null ? contract.getPassportNumber() : "-");
//        row.createCell(col++).setCellValue(kontrakt);
//        row.createCell(col++).setCellValue(tolov);
//        row.createCell(col++).setCellValue(qarz);
//        row.createCell(col++).setCellValue(String.format("%.2f%%", foiz));
//        row.createCell(col++).setCellValue(agentPul);
//        row.createCell(col++).setCellValue(paymentStatus);
//        row.createCell(col++).setCellValue(createdAt);
//        row.createCell(col++).setCellValue(discount);
//        row.createCell(col++).setCellValue(isStudy);
//        row.createCell(col++).setCellValue(studyTime);
//    }
//
//    private void createAgentHeader(Workbook workbook, Sheet sheet) {
//        Row header = sheet.createRow(0);
//        String[] headers = {
//                "№", "F.I.Sh.", "Telefon", "Gruhi", "Passport JSHSHR",
//                "Kontrakt miqdori", "To‘lov qilingan pul", "Qoldiq",
//                "To‘lov foizda", "Agentga berilishi kerak bo‘lgan pul",
//                "Agentga berilgan (To‘lov)", "Qabulda sana", "Imtiyoz","O'qiydi","O'qishni toxtatgan sana"
//        };
//        CellStyle style = workbook.createCellStyle();
//        Font font = workbook.createFont();
//        font.setBold(true);
//        style.setFont(font);
//        for (int i = 0; i < headers.length; i++) {
//            Cell cell = header.createCell(i);
//            cell.setCellValue(headers[i]);
//            cell.setCellStyle(style);
//        }
//    }
//}
