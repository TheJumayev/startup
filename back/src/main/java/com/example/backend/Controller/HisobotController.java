package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.ContractRepo;
import com.example.backend.Repository.DiscountStudentRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/hisobot")
public class HisobotController {

    private final GroupsRepo groupsRepo;
    private final StudentRepo studentRepo;
    private final ContractRepo contractRepo;
    private final DiscountStudentRepo discountStudentRepo;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final double MIN_PAYMENT_PERCENT = 25.0;

    @GetMapping("/agent-statistic")
    public ResponseEntity<byte[]> exportAgentStatisticExcel() {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet summarySheet = workbook.createSheet("Umumiy hisobot");

            Row header = summarySheet.createRow(0);

            String[] headers = {
                    "T/r",
                    "Agent nomi",
                    "Soni",
                    "20% dan 24% gacha to'lov qilganlar soni",
                    "25% dan ko'p To‘lov qilgan soni",
                    "Umuman to'lov qilmagan soni",
                    "Agentga mukofotiga berilgan pul",
                    "Berilishi kerak bo'lgan pul"
            };

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Map<String, Sheet> sheetMap = new HashMap<>();
            Map<String, AgentSummary> agentStats = new HashMap<>();

            List<Student> students = studentRepo.findAllByGroupLevel();

            for (Student student : students) {

                Contract contract = null;

                try {
                    Long hemisId = Long.parseLong(student.getStudentIdNumber());
                    contract = contractRepo.findByHemisId(hemisId);
                } catch (Exception ignored) {}

                if (contract == null) continue;

                String agentName = "";
                String createdAt = "-";
                String phone = "-";
                String amountForAgent = "";
                String isStudy="";
                String studyTime = "";

                double reward = 0.0;

                // ================= API ================= //
                Integer educationTypeId = 0;
                try {
                    if (contract.getPassportNumber() != null) {
//                        http://172.20.172.24:8080/

                        String url = "http://172.20.172.24:8080/api/v1/abuturient/student/" + contract.getPassportNumber();

                        System.out.println(url);

                        ResponseEntity<Map> response =
                                restTemplate.getForEntity(url, Map.class);
                        System.out.println(response);
                        if (response.getStatusCode() == HttpStatus.OK
                                && response.getBody() != null) {


                            Map<String, Object> body = response.getBody();

                            System.out.println(body);
                            Object agentObj = body.get("agent");

                            agentName = (agentObj == null)
                                    ? ""
                                    : ((Map<String, Object>) agentObj)
                                    .getOrDefault("name", "")
                                    .toString();

                            createdAt = (String) body.getOrDefault("createdAt", "-");

                            String amountStr =
                                    body.get("amount") != null
                                            ? body.get("amount").toString()
                                            : "0";


                            try {
                                if (body.get("educationField") instanceof Map<?, ?> educationField) {

                                    Object educationFormObj = educationField.get("educationForm");

                                    if (educationFormObj instanceof Map<?, ?> educationForm) {

                                        Object educationTypeObj = educationForm.get("educationType");

                                        if (educationTypeObj instanceof Map<?, ?> educationType) {

                                            Object idObj = educationType.get("id");

                                            if (idObj != null) {
                                                educationTypeId = Integer.parseInt(idObj.toString());
                                            }
                                        }
                                    }
                                }
                            } catch (Exception ignored) {

                                educationTypeId = 0;
                            }
                            phone = (String) body.get("phone");
                            amountForAgent = amountStr;

                            try {
                                reward = Double.parseDouble(amountStr);
                            } catch (Exception ignored) {}
                        }
                    }
                } catch (Exception ignored) {
                    System.out.println("fuck");
                }

                // ================= Agent fallback ================= //
                String finalAgentName = agentName;

                try {
                    if (
                            agentName.equalsIgnoreCase("BXU") ||
                                    agentName.equalsIgnoreCase("Instagram") ||
                                    agentName.equalsIgnoreCase("Behruz Target") ||
                                    agentName.isBlank()
                    ) {

                        if (!createdAt.equals("-")) {

                            LocalDate date =
                                    LocalDate.parse(createdAt.split("T")[0]);

                            LocalDate cutoff =
                                    LocalDate.of(2025, 7, 1);

                            if (date.isAfter(cutoff) && educationTypeId !=2 ) {
                                finalAgentName = "Behruz Target";
                            } else {
                                finalAgentName = "Buxoro xalqaro universiteti";
                            }
                        } else {
                            finalAgentName = "Buxoro xalqaro universiteti";
                        }
                    }
                } catch (Exception ignored) {}

                // ================= Contract data ================= //

                double kontrakt =
                        contract.getAmount() != null ? contract.getAmount() : 0;

                double payment =
                        contract.getPayment() != null ? contract.getPayment() : 0;

                double foiz =
                        kontrakt > 0 ? (payment / kontrakt * 100) : 0;

                // ================= agentPul (berilishi kerak) ================= //
                double agentPul = 1_000_000;
                if(finalAgentName.equals("Behruz Target")) agentPul = 800_0000;
                if (foiz < 25) {
                    agentPul = 0;
                }

                // ================= SUMMARY UPDATE ================= //
                AgentSummary stat =
                        agentStats.computeIfAbsent(
                                finalAgentName,
                                k -> new AgentSummary()
                        );

                stat.total++;

                // ❌ Umuman to‘lamagan
                if (payment == 0) {
                    stat.unpaid++;
                }

                // ⚠️ 20% - 24%
                if (foiz > 20 && foiz < 25) {
                    stat.percent24++;
                }

                // ✅ 25%+
                if (foiz >= 25) {
                    stat.percent25++;

                    stat.shouldReward += agentPul;
                    stat.paidReward += reward;
                }

                // agent sheet
                writeAgentRow(
                        workbook,
                        sheetMap,
                        finalAgentName,
                        contract,
                        student,
                        amountForAgent,
                        createdAt,
                        phone,
                        isStudy,
                        studyTime
                );
            }

            // ================= SUMMARY WRITE ================= //

            int index = 1;
            int rowIndex = 1;

            for (Map.Entry<String, AgentSummary> entry : agentStats.entrySet()) {

                AgentSummary s = entry.getValue();

                Row row = summarySheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(index++);
                row.createCell(1).setCellValue(entry.getKey());
                row.createCell(2).setCellValue(s.total);
                row.createCell(3).setCellValue(s.percent24);
                row.createCell(4).setCellValue(s.percent25);
                row.createCell(5).setCellValue(s.unpaid);
                row.createCell(6).setCellValue(s.paidReward);
                row.createCell(7).setCellValue(s.shouldReward);
            }

            // ================= TOTAL ROW ================= //
            Row totalRow = summarySheet.createRow(rowIndex + 1);

            totalRow.createCell(0).setCellValue("JAMI");

            totalRow.createCell(2)
                    .setCellFormula("SUM(C2:C" + rowIndex + ")");
            totalRow.createCell(3)
                    .setCellFormula("SUM(D2:D" + rowIndex + ")");
            totalRow.createCell(4)
                    .setCellFormula("SUM(E2:E" + rowIndex + ")");
            totalRow.createCell(5)
                    .setCellFormula("SUM(F2:F" + rowIndex + ")");
            totalRow.createCell(6)
                    .setCellFormula("SUM(G2:G" + rowIndex + ")");
            totalRow.createCell(7)
                    .setCellFormula("SUM(H2:H" + rowIndex + ")");

            // autosize
            // ================= AUTO SIZE FOR ALL AGENT SHEETS =================
            for (Sheet sheet : sheetMap.values()) {
                for (int i = 0; i < 15; i++) { // 15 ta ustun
                    sheet.autoSizeColumn(i);
                }
            }

// ================= TOTALS FOR EACH AGENT SHEET =================
            for (Sheet sheet : sheetMap.values()) {

                sheet.createFreezePane(0, 1); // header freeze

                int lastDataRow = sheet.getLastRowNum(); // oxirgi data qatori
                int dataEndRow = lastDataRow + 1;        // Excel index uchun

                // ===== STYLES =====
                CellStyle boldStyle = workbook.createCellStyle();
                Font boldFont = workbook.createFont();
                boldFont.setBold(true);
                boldStyle.setFont(boldFont);
                boldStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                boldStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                DataFormat df = workbook.createDataFormat();
                CellStyle moneyStyle = workbook.createCellStyle();
                moneyStyle.setDataFormat(df.getFormat("#,##0.00"));
                moneyStyle.setFont(boldFont);
                moneyStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
                moneyStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

                // ================= 1️⃣ JAMI SONI =================
                Row jamiSoniRow = sheet.createRow(dataEndRow + 1);

                jamiSoniRow.createCell(0).setCellValue("JAMI SONI:");
                jamiSoniRow.getCell(0).setCellStyle(boldStyle);

                // Passport count
                jamiSoniRow.createCell(4)
                        .setCellFormula(String.format("COUNTA(E2:E%d)", dataEndRow));
                jamiSoniRow.getCell(4).setCellStyle(boldStyle);

                // Kontrakt count
                jamiSoniRow.createCell(5)
                        .setCellFormula(String.format("COUNTA(F2:F%d)", dataEndRow));
                jamiSoniRow.getCell(5).setCellStyle(boldStyle);

                // To‘lov qilganlar
                jamiSoniRow.createCell(6)
                        .setCellFormula(String.format("COUNTIF(G2:G%d,\">0\")", dataEndRow));
                jamiSoniRow.getCell(6).setCellStyle(boldStyle);

                // Qoldiq borlar
                jamiSoniRow.createCell(7)
                        .setCellFormula(String.format("COUNTIF(H2:H%d,\">0\")", dataEndRow));
                jamiSoniRow.getCell(7).setCellStyle(boldStyle);

                // 25% dan yuqori (agentPul > 0)
                jamiSoniRow.createCell(9)
                        .setCellFormula(String.format("COUNTIF(J2:J%d,\">0\")", dataEndRow));
                jamiSoniRow.getCell(9).setCellStyle(boldStyle);

                // Agentga to‘langan
                jamiSoniRow.createCell(10)
                        .setCellFormula(String.format("COUNTIF(K2:K%d,\">0\")", dataEndRow));
                jamiSoniRow.getCell(10).setCellStyle(boldStyle);

                // Imtiyoz borlar
                jamiSoniRow.createCell(12)
                        .setCellFormula(String.format("COUNTIF(M2:M%d,\"<>-\")", dataEndRow));
                jamiSoniRow.getCell(12).setCellStyle(boldStyle);

                // ================= 2️⃣ JAMI HISOB =================
                Row jamiHisobRow = sheet.createRow(dataEndRow + 2);

                jamiHisobRow.createCell(0).setCellValue("JAMI HISOB:");
                jamiHisobRow.getCell(0).setCellStyle(boldStyle);

                // Kontrakt summasi
                jamiHisobRow.createCell(5)
                        .setCellFormula(String.format("SUM(F2:F%d)", dataEndRow));
                jamiHisobRow.getCell(5).setCellStyle(moneyStyle);

                // To‘langan summa
                jamiHisobRow.createCell(6)
                        .setCellFormula(String.format("SUM(G2:G%d)", dataEndRow));
                jamiHisobRow.getCell(6).setCellStyle(moneyStyle);

                // Qoldiq
                jamiHisobRow.createCell(7)
                        .setCellFormula(String.format("SUM(H2:H%d)", dataEndRow));
                jamiHisobRow.getCell(7).setCellStyle(moneyStyle);

                // Berilishi kerak bo‘lgan (agentPul)
                jamiHisobRow.createCell(9)
                        .setCellFormula(String.format("SUM(J2:J%d)", dataEndRow));
                jamiHisobRow.getCell(9).setCellStyle(moneyStyle);

                // Berilgan mukofot
                jamiHisobRow.createCell(10)
                        .setCellFormula(String.format(
                                "SUMIF(K2:K%d,\">0\",K2:K%d)",
                                dataEndRow, dataEndRow
                        ));
                jamiHisobRow.getCell(10).setCellStyle(moneyStyle);
            }

            // ================= EXPORT ================= //
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            workbook.write(output);

            String fileName =
                    "Agent_Statistic_" +
                            LocalDate.now().format(DateTimeFormatter.ISO_DATE)
                            + ".xlsx";

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=" + fileName
                    )
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(output.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(e.getMessage().getBytes());
        }
    }

    static class AgentSummary {

        int total = 0;

        int percent24 = 0;

        int percent25 = 0;

        int unpaid = 0;

        double paidReward = 0;      // mukofotiga berilgan pul
        double shouldReward = 0;    // berilishi kerak bo‘lgan pul
    }

    private void writeAgentRow(Workbook workbook, Map<String, Sheet> sheetMap, String sheetName,
                               Contract contract, Student student, String paymentStatus, String createdAt, String phone, String isStudy, String studyTime) throws IOException {
        Sheet sheet = sheetMap.computeIfAbsent(sheetName, k -> {
            Sheet s = workbook.createSheet(k);
            createAgentHeader(workbook, s);
            s.createFreezePane(0, 1); // freeze header row
            return s;
        });

        int rowIndex = sheet.getLastRowNum() + 1;
        Row row = sheet.createRow(rowIndex);
        int col = 0;
        String passportNumber = contract.getPassportNumber();
        String discount = "-";
        double agentPul = 1_000_000;

        try {
            String url = "https://edu.bxu.uz/api/v1/discount-student/" + passportNumber;
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object discountListObj = body.get("discountByYear");

                if (discountListObj instanceof List<?>) {
                    List<?> discountList = (List<?>) discountListObj;
                    StringBuilder sb = new StringBuilder();

                    for (Object obj : discountList) {
                        if (obj instanceof Map<?, ?> discountItem) {
                            String name = (String) discountItem.get("name");
                            Object discountValueObj = discountItem.get("discount");
                            double discountValue = 0;
                            if (discountValueObj != null) {
                                try {
                                    discountValue = Double.parseDouble(discountValueObj.toString());
                                } catch (Exception ignored) {}
                            }

                            if (sb.length() > 0) sb.append("; ");
                            sb.append(name).append(": ").append(discountValue);

                            if ("2025-2026".equals(name)) {
                                double kontraktAmount = contract != null && contract.getAmount() != null ? contract.getAmount() : 0;
                                if (kontraktAmount > 0) {
                                    agentPul = 1_000_000 - (discountValue / kontraktAmount) * 1_000_000;
                                }
                            }
                        }
                    }
                    discount = sb.toString();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        double kontrakt = contract != null && contract.getAmount() != null ? contract.getAmount() : 0;
        double tolov = contract != null && contract.getPayment() != null ? contract.getPayment() : 0;
        double qarz = contract != null && contract.getDebt() != null ? contract.getDebt() : 0;
        double foiz = (kontrakt > 0) ? (tolov / kontrakt * 100) : 0;

        // 🧠 New rule: if payment percent < 25%, no agent reward
        if (foiz < MIN_PAYMENT_PERCENT) {
            agentPul = 0.0;
        }

        row.createCell(col++).setCellValue(rowIndex);
        row.createCell(col++).setCellValue(contract != null ? contract.getFullName() : student.getFullName());
        row.createCell(col++).setCellValue(phone);
        row.createCell(col++).setCellValue(student.getGroupName());
        row.createCell(col++).setCellValue(contract != null ? contract.getPassportNumber() : "-");
        row.createCell(col++).setCellValue(kontrakt);
        row.createCell(col++).setCellValue(tolov);
        row.createCell(col++).setCellValue(qarz);
        row.createCell(col++).setCellValue(String.format("%.2f%%", foiz));
        row.createCell(col++).setCellValue(agentPul);
        row.createCell(col++).setCellValue(paymentStatus);
        row.createCell(col++).setCellValue(createdAt);
        row.createCell(col++).setCellValue(discount);
        row.createCell(col++).setCellValue(isStudy);
        row.createCell(col++).setCellValue(studyTime);
    }

    private void createAgentHeader(Workbook workbook, Sheet sheet) {
        Row header = sheet.createRow(0);
        String[] headers = {
                "№", "F.I.Sh.", "Telefon", "Gruhi", "Passport JSHSHR",
                "Kontrakt miqdori", "To‘lov qilingan pul", "Qoldiq",
                "To‘lov foizda", "Agentga berilishi kerak bo‘lgan pul",
                "Agentga berilgan (To‘lov)", "Qabulda sana", "Imtiyoz","O'qiydi","O'qishni toxtatgan sana"
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
}
