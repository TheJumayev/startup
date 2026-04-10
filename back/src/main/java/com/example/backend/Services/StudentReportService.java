package com.example.backend.Services;

import com.example.backend.Entity.Contract;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.ContractRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.TokenHemisRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentReportService {
    private final TokenHemisRepo tokenHemisRepo;
    private final ExternalApiService externalApiService;
    private final StudentRepo studentRepo;
    private final ContractRepo contractRepo;
    private final GroupsRepo groupsRepo;

    // Constants for column indices to avoid magic numbers
    private static final int STUDENT_COLUMNS_COUNT = 19+1; // Columns 0-18 are student details
    private static final int SUBJECT_START_COL = 19+1; // Subject semester starts at column 19
    private static final int SUBJECT_COLUMNS_COUNT = 5; // semester, name, credit, ball, grade
    private static final int REMAINING_START_COL = 24+1; // Remaining fields start at column 24

    /* ================= EXCEL ================= */
    public byte[] generateExcel(UUID groupId) {
        try (Workbook workbook = new XSSFWorkbook()) {

            Optional<Groups> byId = groupsRepo.findById(groupId);
            String  nameGroup="";
            if (byId.isPresent()){
                nameGroup= byId.get().getName();
            }

            /* ================= 1-SHEET: UMUMIY MA'LUMOT (ESKI LOGIKA) ================= */
            Sheet sheet = workbook.createSheet("Umumiy ma'lumot");
            String titleText = nameGroup + " - Guruh hisoboti (" + LocalDate.now() + ")";

            /* ===== STYLE ===== */
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            /* ===== TITLE ROW (1-SHEET) ===== */
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(titleText);
            titleCell.setCellStyle(titleStyle);

            /* MERGE */
            sheet.addMergedRegion(
                    new CellRangeAddress(
                            0, 0,
                            0, headers().size() - 1
                    )
            );

            /* HEADER 1 qator pastga tushadi */
            createHeader(sheet, 1);
            int rowIdx = 2;



            var tokens = tokenHemisRepo.findAll();
            String token = tokens.get(tokens.size() - 1).getName();

            List<Student> students = studentRepo.findAllByGroupId(groupId);


            int index = 1;

            /* ================= 2-SHEET: QISQA MA'LUMOT ================= */
            Sheet shortSheet = workbook.createSheet("Qisqa ma'lumot");
            Row shortTitleRow = shortSheet.createRow(0);
            Cell shortTitleCell = shortTitleRow.createCell(0);
            shortTitleCell.setCellValue(titleText);
            shortTitleCell.setCellStyle(titleStyle);

            shortSheet.addMergedRegion(
                    new CellRangeAddress(
                            0, 0,
                            0, headers().size() - 1
                    )
            );

            /* HEADER 1 qator pastga */
            Row shortHeader = shortSheet.createRow(1);
            int shortRowIdx = 2;

            List<String> shortHeaders = new java.util.ArrayList<>(headers());
            shortHeaders.set(20, "Fanlar soni");                    // Fan semestri o'rniga
            shortHeaders.set(21, "O'zlashtirilmagan fanlar soni");  // Fan nomi o'rniga
//            shortHeaders.set(22, "");                               // Kredit o'rniga
//            shortHeaders.set(23, "");                               // Ball o'rniga
//            shortHeaders.set(24, "");                               // Baho o'rniga

            for (int i = 0; i < shortHeaders.size(); i++) {
                shortHeader.createCell(i).setCellValue(shortHeaders.get(i));
            }



            for (Student s : students) {
                Contract c = getContractSafe(s);

                ResponseEntity<?> studentResponse = externalApiService.sendRequest(
                        "v1/data/student-info",
                        HttpMethod.GET,
                        Map.of("Authorization", "Bearer " + token),
                        Map.of("student_id_number", s.getStudentIdNumber()),
                        null
                );

                List<Map<String, Object>> subjects = null;

                if (studentResponse.getStatusCode().is2xxSuccessful()) {
                    Map<String, Object> responseBody = (Map<String, Object>) studentResponse.getBody();
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    subjects = (List<Map<String, Object>>) data.get("subjects");
                }

                int totalSubjects = 0;
                int failedSubjects = 0;

                if (subjects != null && !subjects.isEmpty()) {
                    totalSubjects = subjects.size();

                    for (Map<String, Object> subject : subjects) {
                        Number totalPoint = (Number) subject.get("total_point");
                        if (totalPoint != null && totalPoint.doubleValue() < 60) {
                            failedSubjects++;
                        }
                    }
                }

                /* ================== ESKI LOGIKA (UMUMIY MA'LUMOT) ================== */
                if (subjects != null && !subjects.isEmpty()) {
                    for (int i = 0; i < subjects.size(); i++) {
                        Map<String, Object> subject = subjects.get(i);
                        Row row = sheet.createRow(rowIdx++);

                        if (i == 0) {
                            fillStudentDetails(row, s, c, index);
                        } else {
                            for (int j = 0; j < STUDENT_COLUMNS_COUNT; j++) {
                                row.createCell(j).setCellValue("");
                            }
                        }

                        fillSubjectDetails(row, subject);

                        if (i == 0) {
                            fillRemainingFields(row, s);
                        } else {
                            for (int j = REMAINING_START_COL; j < headers().size(); j++) {
                                row.createCell(j).setCellValue("");
                            }
                        }
                    }
                    index++;
                } else {
                    Row row = sheet.createRow(rowIdx++);
                    fillStudentDetails(row, s, c, index++);
                    fillEmptySubjectDetails(row);
                    fillRemainingFields(row, s);
                }

                /* ================== QISQA MA'LUMOT SHEET ================== */
                Row shortRow = shortSheet.createRow(shortRowIdx++);
                fillStudentDetails(shortRow, s, c, index-1);

                int col = SUBJECT_START_COL;
                shortRow.createCell(col++).setCellValue(totalSubjects);
                shortRow.createCell(col++).setCellValue(failedSubjects);

                fillRemainingFields(shortRow, s);
            }

            for (int i = 0; i < headers().size(); i++) {
                sheet.autoSizeColumn(i);
                shortSheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Excel yaratishda xatolik", e);
        }
    }

    private void fillStudentDetails(Row row, Student s, Contract c, int index) {
        int col = 0;
        row.createCell(col++).setCellValue(index);
        row.createCell(col++).setCellValue(str(s.getSpecialtyName()));
        row.createCell(col++).setCellValue(str(s.getEducationForm()));
        row.createCell(col++).setCellValue(str(s.getEducationType()));
        row.createCell(col++).setCellValue(str(s.getFullName()));
        // JSHSHIR
        row.createCell(col++).setCellValue(
                c != null ? str(c.getPassportNumber()) : "Topilmadi"
        );
        row.createCell(col++).setCellValue(str(s.getPhone()));
        row.createCell(col++).setCellValue(str(s.getQabulBuyruqRaqami()));
        row.createCell(col++).setCellValue(str(s.getGroupName()));
        row.createCell(col++).setCellValue(str(s.getLevel()));
        row.createCell(col++).setCellValue(str(s.getSemesterName()));
        row.createCell(col++).setCellValue(str(s.getProvince()) + " " + str(s.getDistrict()));

        // Nogironlik
        row.createCell(col++).setCellValue(
                Boolean.TRUE.equals(s.getNogiron()) ? str(s.getNogironText()) : ""
        );

        // IELTS
        row.createCell(col++).setCellValue(
                Boolean.TRUE.equals(s.getIelts()) ? str(s.getIeltsText()) : ""
        );



        // Hemisda mavjudligi
        row.createCell(col++).setCellValue(
                Boolean.TRUE.equals(s.getIsMy()) ? "Mavjud emas" : "Mavjud"
        );
        row.createCell(col++).setCellValue(str(s.getPaymentForm()));
        row.createCell(col++).setCellValue(
                c != null && c.getAmount() != null ? c.getAmount() : 0
        );


        row.createCell(col++).setCellValue(
                c != null && c.getDiscount() != null ? c.getDiscount() : 0
        );

        row.createCell(col++).setCellValue(
                c != null && c.getPayment() != null ? c.getPayment() : 0
        );

        row.createCell(col++).setCellValue(
                Boolean.TRUE.equals(s.getIsOnline()) ? "Erkin jadval" : "Offline"
        );
    }

    private void fillSubjectDetails(Row row, Map<String, Object> subject) {
        int col = SUBJECT_START_COL;

        Map<String, Object> semester = (Map<String, Object>) subject.get("semester");
        String semesterName = semester != null ? (String) semester.get("name") : "";
        String subjectName = (String) subject.get("name");
        Number credit = (Number) subject.get("credit");
        Number totalPoint = (Number) subject.get("total_point");
        Number grade = (Number) subject.get("grade");

        row.createCell(col++).setCellValue(semesterName);
        row.createCell(col++).setCellValue(subjectName);
        row.createCell(col++).setCellValue(credit != null ? credit.doubleValue() : 0);
        row.createCell(col++).setCellValue(totalPoint != null ? totalPoint.doubleValue() : 0);
        row.createCell(col++).setCellValue(grade != null ? grade.doubleValue() : 0);
    }

    private void fillEmptySubjectDetails(Row row) {
        int col = SUBJECT_START_COL;
        row.createCell(col++).setCellValue(""); // Semester
        row.createCell(col++).setCellValue(""); // Subject Name
        row.createCell(col++).setCellValue(0);  // Credit
        row.createCell(col++).setCellValue(0);  // Total Point
        row.createCell(col++).setCellValue(0);  // Grade
    }

    private void fillRemainingFields(Row row, Student s) {
        int col = REMAINING_START_COL;

        row.createCell(col++).setCellValue(str(s.getIchkiPerevodBuyruqRaqami()));
        row.createCell(col++).setCellValue(str(s.getTashqiPerevodBuyruqRaqami()));
        row.createCell(col++).setCellValue(
                s.getAvgGpa() != null ? s.getAvgGpa() : 0
        );

        row.createCell(col++).setCellValue(
                str(s.getTalabalarSafidanChetlashganBuyruqRaqami())
        );

        row.createCell(col++).setCellValue(
                str(s.getKursdanOtganBuyruqRaqami())
        );

        row.createCell(col++).setCellValue(str(s.getOther()));
        row.createCell(col++).setCellValue(
                Boolean.TRUE.equals(s.getIsHaveWork()) ? "ishlaydi" : "ishlamaydi"
        );
        row.createCell(col++).setCellValue(
                formatAchievements(s.getStudentAchievements())
        );
    }

    private Contract getContractSafe(Student s) {
        try {
            if (s.getStudentIdNumber() == null) return null;
            Long hemisId = Long.parseLong(s.getStudentIdNumber());
            return contractRepo.findByHemisId(hemisId);
        } catch (Exception e) {
            return null;
        }
    }

    private String str(String s) {
        return s == null ? "" : s;
    }

    private void createHeader(Sheet sheet, int rowIndex) {
        Row header = sheet.createRow(rowIndex);
        int col = 0;
        for (String h : headers()) {
            header.createCell(col++).setCellValue(h);
        }
    }

    private String formatAchievements(List<String> achievements) {
        if (achievements == null || achievements.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < achievements.size(); i++) {
            sb.append(i + 1)
                    .append(". ")
                    .append(achievements.get(i));

            if (i < achievements.size() - 1) {
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    private List<String> headers() {
        return List.of(
                "№", "Ta'lim yo'nalishi", "Ta'lim shakli", "Ta'lim turi",
                "F.I.O", "JSHSHIR", "Telefon raqam", "Qabul buyrug'i", "Guruh",  "Kursi",
                "Semestr",  "Manzili",
                "Nogironlik guruhi", "Til sertifikati",
                "Hemisda mavjudligi", "Kontrakt turi", "Kontrakt miqdori",
                "Kontrakt imtiyozi", "To'langan summa", "Erkin jadval",
                "Fan semestri", "Fan nomi", "Kredit", "Ball", "Baho",
                "Ichki perevod", "Tashqi perevod", "GPA",
                "Chetlashtirilgan buyruq", "Kursdan o'tgan buyruq",
                "Oldingi ta'lim", "Ish bilan ta'minlanganligi",  "Talaba yutuqlari"
        );
    }
}