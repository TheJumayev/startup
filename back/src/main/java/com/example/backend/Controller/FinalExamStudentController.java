package com.example.backend.Controller;

import com.example.backend.DTO.HisobotDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/final-exam-student")
public class FinalExamStudentController {
    private final FinalExamRepo finalExamRepo;
    private final StudentRepo studentRepo;
    private final ContractRepo contractRepo;
    private final DiscountStudentRepo discountStudentRepo;
    private final ScoreSheetRepo scoreSheetRepo;
    private final ScoreSheetGroupRepo scoreSheetGroupRepo;
    private final FinalExamStudentRepo finalExamStudentRepo;
    private final ContractAmountRepo contractAmountRepo;
    private final AttachmentRepo attachmentRepo;
    private final TestCurriculumSubjectRepo testCurriculumSubjectRepo;
    private final FinalExamStudentTestRepo finalExamStudentTestRepo;
    private final UniverPcRepo univerPcRepo;
    private final FinalExamStudentHistoryRepo finalExamStudentHistoryRepo;
    private final KafolatXatiRepo kafolatXatiRepo;


    @GetMapping(
            value = "/allHisobot/simple",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    public ResponseEntity<byte[]> getAllHisobotSimple() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Guruhlar bo'yicha");
            createGroupSimpleSheet(sheet, workbook);

            workbook.write(outputStream);
            byte[] excelBytes = outputStream.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"guruh_hisobot.xlsx\"");
            headers.setContentLength(excelBytes.length);

            return ResponseEntity.ok().headers(headers).body(excelBytes);

        } catch (Exception e) {
            throw new RuntimeException("Excel fayl yaratishda xatolik: " + e.getMessage(), e);
        }
    }

    private static class SubState {
        boolean amaliyot; // isAmaliyot
        int mid;          // mustaqil+oraliq (faqat oddiy fanlar uchun)

        SubState(boolean amaliyot, int mid) {
            this.amaliyot = amaliyot;
            this.mid = mid;
        }
    }


    // ==============================
    //  SHEET: Guruhlar bo'yicha
    // ==============================
    private void createGroupSimpleSheet(Sheet sheet, Workbook wb) {

        CellStyle headerStyle  = createHeaderStyle(wb);
        CellStyle textStyle    = createTextStyle(wb);
        CellStyle intStyle     = createIntStyle(wb);
        CellStyle percentStyle = createPercentStyle(wb);
        CellStyle totalStyle   = createTotalStyle(wb); // ishlatmasangiz ham turaversin

        String[] headers = {
                "№", "Guruh", "Jami",
                "on", "yn", "2", "3", "4", "5",
                "2 (%)", "3–4–5 (%)", "4–5 (%)"
        };

        // Header row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell c = headerRow.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        sheet.setColumnWidth(0, 1200);
        sheet.setColumnWidth(1, 5200);
        sheet.setColumnWidth(2, 2500);

        sheet.setColumnWidth(3, 1700); // on
        sheet.setColumnWidth(4, 1700); // yn
        sheet.setColumnWidth(5, 1500); // 2
        sheet.setColumnWidth(6, 1500); // 3
        sheet.setColumnWidth(7, 1500); // 4
        sheet.setColumnWidth(8, 1500); // 5

        sheet.setColumnWidth(9, 2600);   // 2(%)
        sheet.setColumnWidth(10, 3600);  // 3-4-5(%)
        sheet.setColumnWidth(11, 3200);  // 4-5(%)

        sheet.createFreezePane(0, 1);
        sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, headers.length - 1));

        // =========================
        // DATA
        // =========================
        List<ScoreSheet> all = scoreSheetRepo.findAllWithRelations();

        // subjectId -> isAmaliyot (FinalExam'dan)
        Map<UUID, Boolean> amaliyotBySubject = new HashMap<>();
        for (Object[] row : finalExamRepo.findSubjectAmaliyotPairs()) {
            UUID subjectId = (UUID) row[0];
            Boolean isAmaliyot = (Boolean) row[1];
            amaliyotBySubject.putIfAbsent(subjectId, Boolean.TRUE.equals(isAmaliyot));
        }

        // groupName -> studentId -> subjectId -> SubState
        Map<String, Map<UUID, Map<UUID, SubState>>> map = new HashMap<>();

        for (ScoreSheet ss : all) {
            if (ss == null) continue;
            if (ss.getStudent() == null || ss.getStudent().getId() == null) continue;
            if (ss.getScoreSheetGroup() == null) continue;
            if (ss.getScoreSheetGroup().getGroup() == null) continue;
            if (ss.getScoreSheetGroup().getGroup().getName() == null) continue;
            if (ss.getScoreSheetGroup().getCurriculumSubject() == null ||
                    ss.getScoreSheetGroup().getCurriculumSubject().getId() == null) continue;

            String groupName = ss.getScoreSheetGroup().getGroup().getName();
            UUID studentId = ss.getStudent().getId();
            UUID subjectId = ss.getScoreSheetGroup().getCurriculumSubject().getId();

            // ✅ isAmaliyot FinalExam ichidan
            boolean isAmaliyot = Boolean.TRUE.equals(amaliyotBySubject.get(subjectId));

            int mustaqil = ss.getMustaqil() == null ? 0 : ss.getMustaqil();
            int oraliq   = ss.getOraliq() == null ? 0 : ss.getOraliq();

            // oddiy fan: mid=mustaqil+oraliq, amaliyot: mid=0
            int mid = isAmaliyot ? 0 : (mustaqil + oraliq);

            map.computeIfAbsent(groupName, g -> new HashMap<>())
                    .computeIfAbsent(studentId, s -> new HashMap<>())
                    .merge(subjectId, new SubState(isAmaliyot, mid), (oldV, newV) -> {
                        oldV.amaliyot = oldV.amaliyot || newV.amaliyot;
                        if (!oldV.amaliyot) {
                            oldV.mid = Math.max(oldV.mid, newV.mid);
                        }
                        return oldV;
                    });
        }

        List<String> groupNames = map.keySet().stream().sorted().collect(Collectors.toList());

        int rowNum = 1;
        int index = 1;

        for (String groupName : groupNames) {

            Map<UUID, Map<UUID, SubState>> students = map.get(groupName);
            if (students == null || students.isEmpty()) continue;

            int totalStudents = students.size();

            int on = 0, yn = 0, g2 = 0, g3 = 0, g4 = 0, g5 = 0;

            for (Map.Entry<UUID, Map<UUID, SubState>> stEntry : students.entrySet()) {
                UUID studentId = stEntry.getKey();
                Map<UUID, SubState> subjectMap = stEntry.getValue();

                if (subjectMap == null || subjectMap.isEmpty()) {
                    on++;
                    continue;
                }

                int worstRank = evaluateStudentRank(studentId, subjectMap);

                switch (worstRank) {
                    case 1 -> on++;
                    case 2 -> yn++;
                    case 3 -> g2++;
                    case 4 -> g3++;
                    case 5 -> g4++;
                    case 6 -> g5++;
                }
            }

            double percent2   = totalStudents == 0 ? 0 : (g2 * 1.0 / totalStudents);
            double percent345 = totalStudents == 0 ? 0 : ((g3 + g4 + g5) * 1.0 / totalStudents);
            double percent45  = totalStudents == 0 ? 0 : ((g4 + g5) * 1.0 / totalStudents);

            Row r = sheet.createRow(rowNum++);

            r.createCell(0).setCellValue(index++);
            r.getCell(0).setCellStyle(intStyle);

            r.createCell(1).setCellValue(groupName);
            r.getCell(1).setCellStyle(textStyle);

            r.createCell(2).setCellValue(totalStudents);
            r.getCell(2).setCellStyle(intStyle);

            r.createCell(3).setCellValue(on); r.getCell(3).setCellStyle(intStyle);
            r.createCell(4).setCellValue(yn); r.getCell(4).setCellStyle(intStyle);
            r.createCell(5).setCellValue(g2); r.getCell(5).setCellStyle(intStyle);
            r.createCell(6).setCellValue(g3); r.getCell(6).setCellStyle(intStyle);
            r.createCell(7).setCellValue(g4); r.getCell(7).setCellStyle(intStyle);
            r.createCell(8).setCellValue(g5); r.getCell(8).setCellStyle(intStyle);

            r.createCell(9).setCellValue(percent2);    r.getCell(9).setCellStyle(percentStyle);
            r.createCell(10).setCellValue(percent345); r.getCell(10).setCellStyle(percentStyle);
            r.createCell(11).setCellValue(percent45);  r.getCell(11).setCellStyle(percentStyle);
        }

        // conditional formatting
        addPercentConditionalFormatting(sheet, 1, rowNum - 1, 11);
    }

    // ==============================
    //  Grade (avg score -> grade)
    // ==============================
    // rank: 1=ON, 2=YN, 3=2, 4=3, 5=4, 6=5
    private int calculateRank(int mid, Integer finalBall) {

        // ON: mustaqil+oraliq < 30
        if (mid < 30) return 1;

        // YN: mid >= 30 va yakuniy null yoki 0
        if (finalBall == null || finalBall == 0) return 2;

        // 2: mid >=30 va yakuniy < 30
        if (finalBall < 30) return 3;

        int total = mid + finalBall; // 0..100 deb qaraymiz

        // 3: 60..69
        if (total >= 60 && total <= 69) return 4;

        // 4: 70..89
        if (total >= 70 && total <= 89) return 5;

        // 5: 90..100
        return 6;
    }

    // rank: 1=ON, 2=YN, 3=2, 4=3, 5=4, 6=5
    private int evaluateStudentRank(UUID studentId, Map<UUID, SubState> subjectMap) {

        if (subjectMap == null || subjectMap.isEmpty()) {
            return 1; // fan yo'q -> ON
        }

        boolean hasAmaliyot = false;
        boolean hasNormal = false;

        boolean allNormalMidBelow30 = true;

        int requiredFinalCount = 0;
        int missingFinalCount = 0;

        boolean anyFailTo2 = false;

        int worstRank = 6;

        for (Map.Entry<UUID, SubState> e : subjectMap.entrySet()) {
            UUID subjectId = e.getKey();
            SubState st = e.getValue();
            if (st == null) continue;

            boolean isAmaliyot = st.amaliyot;
            int mid = st.mid;

            if (isAmaliyot) hasAmaliyot = true;
            else hasNormal = true;

            if (!isAmaliyot && mid >= 30) allNormalMidBelow30 = false;

            Integer finalBall = finalExamStudentRepo.findBall(studentId, subjectId).orElse(null);
            boolean finalMissing = (finalBall == null || finalBall == 0);

            boolean finalRequired = isAmaliyot || (!isAmaliyot && mid >= 30);

            if (!finalRequired) {
                continue;
            }

            requiredFinalCount++;

            if (finalMissing) {
                missingFinalCount++;
                continue;
            }

            int total = isAmaliyot ? finalBall : (mid + finalBall);

            if ((!isAmaliyot && (finalBall < 30 || total < 60)) ||
                    (isAmaliyot && total < 60)) {
                anyFailTo2 = true;
                continue;
            }

            int rank;
            if (total <= 69) rank = 4;        // 3
            else if (total <= 89) rank = 5;   // 4
            else rank = 6;                    // 5

            if (rank < worstRank) worstRank = rank;
        }

        if (hasNormal && !hasAmaliyot && allNormalMidBelow30) return 1;

        if (requiredFinalCount > 0 && missingFinalCount == requiredFinalCount) return 2;

        if ((missingFinalCount > 0 && missingFinalCount < requiredFinalCount) || anyFailTo2) return 3;

        return worstRank;
    }

    // ==============================
    //  Conditional Formatting: 4–5(%)
    // ==============================
    private void addPercentConditionalFormatting(Sheet sheet, int fromRow, int toRow, int colIndex) {
        if (toRow < fromRow) return;

        SheetConditionalFormatting cf = sheet.getSheetConditionalFormatting();

        String col = CellReference.convertNumToColString(colIndex);
        int excelFirstRow = fromRow + 1;

        ConditionalFormattingRule r1 =
                cf.createConditionalFormattingRule(String.format("$%s%d>=0.40", col, excelFirstRow));
        PatternFormatting p1 = r1.createPatternFormatting();
        p1.setFillForegroundColor(IndexedColors.BRIGHT_GREEN.getIndex());
        p1.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        ConditionalFormattingRule r2 =
                cf.createConditionalFormattingRule(String.format("AND($%s%d>=0.25,$%s%d<0.40)", col, excelFirstRow, col, excelFirstRow));
        PatternFormatting p2 = r2.createPatternFormatting();
        p2.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        p2.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        ConditionalFormattingRule r3 =
                cf.createConditionalFormattingRule(String.format("$%s%d<0.25", col, excelFirstRow));
        PatternFormatting p3 = r3.createPatternFormatting();
        p3.setFillForegroundColor(IndexedColors.CORAL.getIndex());
        p3.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        CellRangeAddress[] regions = {
                new CellRangeAddress(fromRow, toRow, colIndex, colIndex)
        };

        cf.addConditionalFormatting(regions, new ConditionalFormattingRule[]{r1, r2, r3});
    }

    // ==============================
    //  Styles (minimal, chiroyli)
    // ==============================
    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        setThinBorders(s);
        return s;
    }

    private CellStyle createTextStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        setThinBorders(s);
        return s;
    }

    private CellStyle createIntStyle(Workbook wb) {
        CellStyle s = createTextStyle(wb);
        s.setAlignment(HorizontalAlignment.CENTER);
        DataFormat df = wb.createDataFormat();
        s.setDataFormat(df.getFormat("0"));
        return s;
    }

    private CellStyle createPercentStyle(Workbook wb) {
        CellStyle s = createTextStyle(wb);
        s.setAlignment(HorizontalAlignment.CENTER);
        DataFormat df = wb.createDataFormat();
        s.setDataFormat(df.getFormat("0.0%"));
        return s;
    }

    private CellStyle createTotalStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.MEDIUM);
        s.setBorderTop(BorderStyle.MEDIUM);
        s.setBorderLeft(BorderStyle.MEDIUM);
        s.setBorderRight(BorderStyle.MEDIUM);
        return s;
    }

    private void setThinBorders(CellStyle s) {
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
    }










    @GetMapping("/finalBall/{subjectId}/{studentId}")
    public ResponseEntity<?> getFinalBall(@PathVariable UUID subjectId, @PathVariable UUID studentId) {
        Optional<Integer> ball = finalExamStudentRepo.findBall(studentId, subjectId);

        return ball.isPresent()
                ? ResponseEntity.ok(ball.get())
                : ResponseEntity.ok(0);   // ball bo‘lmasa 0 qaytadi
    }

    @PutMapping("/ball/{finalExamStudentId}/{ball}")
    public ResponseEntity<?> updateFinalBall(@PathVariable UUID finalExamStudentId, @PathVariable Integer ball) {
        Optional<FinalExamStudent> studentExam = finalExamStudentRepo.findById(finalExamStudentId);
        if (studentExam.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FinalExamStudent finalExamStudent = studentExam.get();
        finalExamStudent.setBall(ball);
        FinalExamStudent save = finalExamStudentRepo.save(finalExamStudent);
        return ResponseEntity.ok(save);
    }


    @GetMapping("/hisobot/full/{groupId}")
    public ResponseEntity<?> getFullReport(@PathVariable UUID groupId) {

        // 1) Guruhdagi talabalar
        List<Student> students = studentRepo.findAllByGroupId(groupId);

        // 2) Guruhga tegishli barcha ScoreSheetGroup → ya’ni barcha fanlar
        List<ScoreSheetGroup> groups = scoreSheetGroupRepo.findAllByGroup_Id(groupId);

        Map<String, Object> result = new HashMap<>();

        // === FANLAR RO‘YXATI ===
        List<Map<String, Object>> subjectsList = new ArrayList<>();
        for (ScoreSheetGroup sg : groups) {
            Map<String, Object> subj = new HashMap<>();
            subj.put("id", sg.getCurriculumSubject().getId());
            subj.put("name", sg.getCurriculumSubject().getSubject().getName());
            subjectsList.add(subj);
        }
        result.put("subjects", subjectsList);

        // === TALABALAR JADVALI ===
        List<Map<String, Object>> studentRows = new ArrayList<>();

        for (Student student : students) {

            Map<String, Object> studentRow = new HashMap<>();
            studentRow.put("studentName", student.getFullName());

            Map<String, Object> scoreMap = new HashMap<>();

            for (ScoreSheetGroup sg : groups) {

                UUID subjectId = sg.getCurriculumSubject().getId();

                Optional<ScoreSheet> sheetOpt =
                        scoreSheetRepo.findByScoreSheetGroupIdAndStudentId(sg.getId(), student.getId());
                int attempt = finalExamStudentRepo
                        .findAttempt(student.getId(), subjectId)
                        .orElse(0);

                int mustaqil = sheetOpt.map(ScoreSheet::getMustaqil).orElse(0);
                int oraliq = sheetOpt.map(ScoreSheet::getOraliq).orElse(0);

                int yakuniy = finalExamStudentRepo.findBall(student.getId(), subjectId).orElse(0);

                int jami = mustaqil + oraliq + yakuniy;

                Map<String, Integer> detail = new HashMap<>();
                detail.put("mustaqil", mustaqil);
                detail.put("oraliq", oraliq);
                detail.put("yakuniy", yakuniy);
                detail.put("jami", jami);
                detail.put("attempt", attempt); // ← YANGI QATOR
                scoreMap.put(sg.getCurriculumSubject().getSubject().getName(), detail);
            }

            studentRow.put("scores", scoreMap);
            studentRows.add(studentRow);
        }

        result.put("students", studentRows);

        return ResponseEntity.ok(result);
    }




    @GetMapping("/one-exam/{id}")
    public HttpEntity<?> getOneFinalExamStudentTest(@PathVariable UUID id){
        Optional<FinalExamStudent> byId = finalExamStudentRepo.findById(id);
        if(byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        FinalExamStudent finalExamStudent = byId.get();
        return ResponseEntity.ok(finalExamStudent);
    }

    @GetMapping("/studentSubjects/{studentId}")
    public  HttpEntity<?> getStudentSubjects(@PathVariable UUID studentId){
        List<FinalExamStudent> students = finalExamStudentRepo.findByStudentId(studentId);
        if (students.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(students);
    }


    @GetMapping("/start-test/{finalExamStudentId}")
    public HttpEntity<?> startTest(
            @PathVariable UUID finalExamStudentId,
            HttpServletRequest request
    ) {

        Optional<FinalExamStudent> byId = finalExamStudentRepo.findById(finalExamStudentId);
        if (byId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found!");
        }

        FinalExamStudent student = byId.get();
        FinalExam finalExam = student.getFinalExam();

        int allowedAttempts = finalExam.getAttempts();
        int usedAttempt = student.getAttempt() == null ? 0 : student.getAttempt();

        // ===== ❗️ Student already passed =====
        if (Boolean.TRUE.equals(student.getIsPassed())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Siz testdan o'tgansiz");
        }

        // ===== ❗️ Time check =====
        if (LocalDateTime.now().isAfter(finalExam.getEndTime())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Exam time is over!");
        }

        // ===== ❗️ Permission check =====
        if (!student.getExamPermission()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to start the exam!");
        }

        // ===== CASE 1: Student continuing same attempt =====
        // ❗️ TO‘G‘RI TEKSHIRISH → endTime == null
        if (usedAttempt >= 1 && student.getEndTime() == null) {
            List<FinalExamStudentTest> oldTests = finalExamStudentTestRepo.findByFinalExamStudentId(finalExamStudentId);
            return ResponseEntity.ok(oldTests);
        }
        // ===== CASE 2: All attempts used =====
        if (usedAttempt >= allowedAttempts) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No attempts remaining.");
        }
        // ===== CASE 3: Student finished last attempt → New attempt =====
        if (usedAttempt >= 1) {
            // 1) Save to history
            saveToHistory(student);
            // 2) Delete old tests
            List<FinalExamStudentTest> old = finalExamStudentTestRepo.findByFinalExamStudentId(finalExamStudentId);
            finalExamStudentTestRepo.deleteAll(old);
            // 3) Reset fields
            student.setCorrectCount(0);
            student.setWrongCount(0);
            student.setBall(0);
            student.setIsPassed(null);
            student.setStartTime(LocalDateTime.now());
            student.setEndTime(null);
        }

        // ===== UPDATE attempt =====
        student.setAttempt(usedAttempt + 1);
        student.setStartTime(LocalDateTime.now());
        student.setEndTime(null);
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String realIp = getClientIp(request);
        student.setIp(realIp);
        finalExamStudentRepo.save(student);

        // ===== Generate new test questions =====
        List<TestCurriculumSubject> all = testCurriculumSubjectRepo
                .findByCurriculumSubjectId(finalExam.getCurriculumSubject().getId());

        int questionCount = Math.min(finalExam.getQuestionCount(), all.size());

        Collections.shuffle(all);
        List<TestCurriculumSubject> selected = all.subList(0, questionCount);

        List<FinalExamStudentTest> newTests = new ArrayList<>();

        for (TestCurriculumSubject q : selected) {
            List<String> answers = new ArrayList<>(Arrays.asList(
                    q.getAnswer1(), q.getAnswer2(), q.getAnswer3(), q.getAnswer4()
            ));

            Collections.shuffle(answers);

            int correctIndex = answers.indexOf(q.getAnswer1()) + 1;

            FinalExamStudentTest test = new FinalExamStudentTest(
                    finalExamStudentId,
                    q,
                    null,
                    null,
                    null,
                    q.getQuestion(),
                    answers,
                    correctIndex
            );

            finalExamStudentTestRepo.save(test);
            newTests.add(test);
        }

        return ResponseEntity.ok(newTests);
    }




    private void saveToHistory(FinalExamStudent student) {

        FinalExamStudentHistory history = FinalExamStudentHistory.builder()
                .student(student.getStudent())
                .finalExam(student.getFinalExam())
                .univerPc(student.getUniverPc())
                .attempt(student.getAttempt())
                .correctCount(student.getCorrectCount())
                .wrongCount(student.getWrongCount())
                .ball(student.getBall())
                .startTime(student.getStartTime())
                .endTime(student.getEndTime())
                .permission(student.getPermission())
                .examPermission(student.getExamPermission())
                .examPermissionText(student.getExamPermissionText())
                .examPermissionTime(student.getExamPermissionTime())
                .examAttachment(student.getExamAttachment())
                .createTime(LocalDateTime.now())
                .endStatus(student.getEndStatus())
                .testCenterBlock(student.getTestCenterBlock())
                .isPassed(student.getIsPassed())
                .build();

        finalExamStudentHistoryRepo.save(history);
    }


    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }


    @GetMapping("/{finalExamId}")
    public ResponseEntity<?> getFinalExamStudent(@PathVariable UUID finalExamId) {
        List<FinalExamStudent> finalExamStundets = finalExamStudentRepo.findByFinalExamId(finalExamId);
        if (finalExamStundets.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(finalExamStundets);
    }


    @PutMapping("/exam-status/{finalExamStudentId}")
    public ResponseEntity<?> updateFinalExamStatus(@PathVariable UUID finalExamStudentId) {
        Optional<FinalExamStudent> student = finalExamStudentRepo.findById(finalExamStudentId);
        if (student.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FinalExamStudent finalExamStudent = student.get();
        finalExamStudent.setExamPermission(false);
        FinalExamStudent save = finalExamStudentRepo.save(finalExamStudent);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/{finalExamStudentId}/{fileId}/{text}")
    public HttpEntity<?> updateFinalExamStudent(@PathVariable UUID finalExamStudentId, @PathVariable UUID fileId, @PathVariable String text) {
        Optional<FinalExamStudent> byId = finalExamStudentRepo.findById(finalExamStudentId);
        if(byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<Attachment> byId1 = attachmentRepo.findById(fileId);
        if(byId1.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Attachment attachment = byId1.get();
        FinalExamStudent finalExamStudent = byId.get();
        boolean nbBlocked = isNbBlocked(
                finalExamStudent.getStudent(),
                finalExamStudent.getFinalExam().getCurriculumSubject().getId()
        );
        if (nbBlocked) {
            finalExamStudent.setExamPermission(false);
            finalExamStudent.setExamPermissionText(
                    "Dars qoldirilgan foizi 25% yoki undan yuqori. Fayl yuklash testga ruxsat bermaydi."
            );
        } else {
            // ✅ NB < 25 bo'lsa: fayl yuklanganini inobatga olib testga ruxsat beramiz
            finalExamStudent.setExamPermission(true);
            finalExamStudent.setExamPermissionText("Fayl qabul qilindi. Testga ruxsat berildi.");
        }
        finalExamStudent.setExamPermissionTime(LocalDateTime.now());
        finalExamStudent.setExamAttachment(attachment);
        finalExamStudentRepo.save(finalExamStudent);
        return ResponseEntity.ok(finalExamStudent);
    }
    private boolean isNbBlocked(Student student, UUID curriculumSubjectId) {

        Optional<ScoreSheetGroup> groupOpt =
                scoreSheetGroupRepo.findByCurriculumSubject_IdAndGroup_Id(
                        curriculumSubjectId,
                        student.getGroup().getId()
                );

        if (groupOpt.isEmpty()) return true;

        Optional<ScoreSheet> scoreOpt =
                scoreSheetRepo.findByScoreSheetGroupIdAndStudentId(
                        groupOpt.get().getId(),
                        student.getId()
                );

        if (scoreOpt.isEmpty()) return true;

        ScoreSheet sheet = scoreOpt.get();

        int totalLoad = 0;
        for (SubjectDetails d : groupOpt.get().getCurriculumSubject().getSubjectDetails()) {
            if (!"17".equals(d.getTrainingCode())) {
                totalLoad += d.getAcademic_load();
            }
        }

        if (totalLoad == 0 || sheet.getSababsizNb() == null) return false;

        double nbPercent = (double) sheet.getSababsizNb() * 100 / totalLoad;

        return nbPercent >= 25; // 🔥 QAT’IY BLOK
    }


    @PutMapping("/change-student/{finalExamStudentId}")
    public HttpEntity<?> changeFinalExamStudent(@PathVariable UUID finalExamStudentId) {
        Optional<FinalExamStudent> byId = finalExamStudentRepo.findById(finalExamStudentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<ContractAmount> allAmounts = contractAmountRepo.findAll();
        if (allAmounts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Contract amount percentage not configured!");
        }
        Integer requiredPercent = allAmounts.get(allAmounts.size() - 1).getAmount();

        FinalExamStudent fes = byId.get();
        if(fes.getFinalExam().getContract()!=null) {
            requiredPercent=fes.getFinalExam().getContract();
        }
        ContractCheckResult contractResult = checkContract(fes.getStudent(), requiredPercent);
        boolean isAmaliyot = Boolean.TRUE.equals(fes.getFinalExam().getIsAmaliyot());

        NbCheckResultAndScore nbScoreResult = checkNbAndScores(
                fes.getStudent(),
                fes.getFinalExam().getCurriculumSubject().getId(),
                isAmaliyot
        );

        boolean finalPermission =
                contractResult.isAllow()
                        && nbScoreResult.isAllow()
                        && nbScoreResult.isAllowOffice()
                        && (isAmaliyot || nbScoreResult.isAllowScore());

        fes.setPermission(finalPermission);
        fes.setExamPermission(finalPermission);

        // ✅ Agar fayl yuklangan bo‘lsa ham, SCORE/OFFICE/CONTRACT shartlarini bosib ketmasin
        if (fes.getExamAttachment() != null
                && nbScoreResult.isAllow()
                && nbScoreResult.isAllowOffice()
                && (isAmaliyot || nbScoreResult.isAllowScore())
                && contractResult.isAllow()
        ) {
            fes.setExamPermission(true);
        }

        if (fes.getPermissionTextList() == null) fes.setPermissionTextList(new ArrayList<>());
        else fes.getPermissionTextList().clear();

        addIfNotEmpty(fes.getPermissionTextList(), contractResult.getInformation());
        addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getInformation());
        addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getScore());
        addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getOfficeDescription());

        finalExamStudentRepo.save(fes);
        return ResponseEntity.ok(fes);
    }

    @PutMapping("/change-status/{finalExamId}")
    public HttpEntity<?> changeExamStatus(@PathVariable UUID finalExamId) {
        Optional<FinalExam> optional = finalExamRepo.findById(finalExamId);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found!");
        }

        FinalExam exam = optional.get();
        UUID groupId = exam.getGroup().getId();
        List<Student> students = studentRepo.findAllByGroupId(groupId);

        List<ContractAmount> allAmounts = contractAmountRepo.findAll();
        if (allAmounts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Contract amount percentage not configured!");
        }
        Integer requiredPercent = allAmounts.get(allAmounts.size() - 1).getAmount();
        if(exam.getContract()!=null) {
            requiredPercent=exam.getContract();
        }
        List<FinalResult> results = new ArrayList<>();

        for (Student s : students) {
            FinalExamStudent fes = finalExamStudentRepo
                    .findByStudentIdAndFinalExamId(s.getId(), finalExamId)
                    .orElseGet(() -> {
                        FinalExamStudent x = new FinalExamStudent();
                        x.setAttempt(0);
                        return x;
                    });

            fes.setStudent(s);
            fes.setFinalExam(exam);

            fes.setPermission(false);
            fes.setExamPermission(false);
            fes.setExamPermissionTime(LocalDateTime.now());

            ContractCheckResult contractResult = checkContract(s, requiredPercent);
            boolean isAmaliyot = Boolean.TRUE.equals(exam.getIsAmaliyot());

            NbCheckResultAndScore nbScoreResult =
                    checkNbAndScores(s, exam.getCurriculumSubject().getId(), isAmaliyot);

            // ✅ amaliyot bo‘lsa score cheklovi yo‘q
            if (isAmaliyot) {
                nbScoreResult.setAllowScore(true);
                nbScoreResult.setScore("");
            }

            boolean finalPermission =
                    contractResult.isAllow()
                            && nbScoreResult.isAllow()
                            && nbScoreResult.isAllowOffice()
                            && (isAmaliyot || nbScoreResult.isAllowScore());

            fes.setPermission(finalPermission);
            fes.setExamPermission(finalPermission);

            // ✅ fayl bor bo‘lsa ham, shartlar buzilsa TRUE qilib yubormasin
            if (fes.getExamAttachment() != null
                    && contractResult.isAllow()
                    && nbScoreResult.isAllow()
                    && nbScoreResult.isAllowOffice()
                    && (isAmaliyot || nbScoreResult.isAllowScore())
            ) {
                fes.setExamPermission(true);
            }

            if (fes.getPermissionTextList() == null) fes.setPermissionTextList(new ArrayList<>());
            else fes.getPermissionTextList().clear();

            addIfNotEmpty(fes.getPermissionTextList(), contractResult.getInformation());
            addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getInformation());
            addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getScore());
            addIfNotEmpty(fes.getPermissionTextList(), nbScoreResult.getOfficeDescription());

            finalExamStudentRepo.save(fes);

            results.add(new FinalResult(
                    s.getId(),
                    s.getFullName(),
                    finalPermission,
                    contractResult.getInformation(),
                    nbScoreResult.getInformation(),
                    nbScoreResult.getScore(),
                    nbScoreResult.getOfficeDescription()
            ));
        }

        exam.setStatus(true);
        finalExamRepo.save(exam);

        return ResponseEntity.ok(results);
    }



    private void addIfNotEmpty(List<String> list, String value) {
        if (value != null && !value.trim().isEmpty()) {
            list.add(value);
        }
    }
    // ======================================
    // 📌 NB + SCORES CHECK
    // ======================================

    private NbCheckResultAndScore checkNbAndScores(Student student, UUID curriculumSubjectId, boolean isAmaliyot) {

        boolean allow = true;                // NB OK
        String information = "";             // NB message

        boolean allowScore = true;           // Score OK
        String score = "";                   // Score message

        boolean allowOffice = true;          // Office OK
        String officeDescription = "";       // Office text

        Optional<ScoreSheetGroup> groupOpt =
                scoreSheetGroupRepo.findByCurriculumSubject_IdAndGroup_Id(
                        curriculumSubjectId,
                        student.getGroup().getId()
                );

        if (groupOpt.isEmpty()) {
            return new NbCheckResultAndScore(false, "Baholar topilmadi", false, "Hisob yo‘q", false, "");
        }

        ScoreSheetGroup group = groupOpt.get();

        Optional<ScoreSheet> scoreOpt =
                scoreSheetRepo.findByScoreSheetGroupIdAndStudentId(group.getId(), student.getId());

        if (scoreOpt.isEmpty()) {
            return new NbCheckResultAndScore(false, "Baholar mavjud emas", false, "Hisob yo‘q", false, "");
        }

        ScoreSheet sheet = scoreOpt.get();

        // =============================
        // 📌 NB CHECK
        // =============================
        int totalLoad = 0;
        for (SubjectDetails d : group.getCurriculumSubject().getSubjectDetails()) {
            if (!"17".equals(d.getTrainingCode())) {
                totalLoad += d.getAcademic_load();
            }
        }

        if (totalLoad == 0) {
            return new NbCheckResultAndScore(false, "Akademik yuklama topilmadi", false, "Hisob yo‘q", false, "");
        }

        double nbPercent = 0;
        if (sheet.getSababsizNb() != null) {
            nbPercent = (double) sheet.getSababsizNb() * 100 / totalLoad;
        }

        if (nbPercent >= 25) {
            allow = false;
            information = "Dars qoldirilgan foizi: " + String.format("%.2f", nbPercent) + "% (25% dan yuqori)";
        }

        // =============================
        // 📌 SCORE CHECK (faqat NO amaliyot)
        // =============================
        if (!isAmaliyot) {

            int mustaqil = sheet.getMustaqil() == null ? 0 : sheet.getMustaqil();
            int oraliq   = sheet.getOraliq() == null ? 0 : sheet.getOraliq();
            int totalScore = mustaqil + oraliq;

            if (totalScore < 30) {
                allowScore = false;
                score = "Ball: " + totalScore + " — 30 balldan kam!";
            }

            if (sheet.getIsAccepted() == null || !sheet.getIsAccepted()) {
                allowScore = false;
                score += " Talaba tomonidan tasdiqlanmagan.";
            }

            if (sheet.getQaytnoma() == null) {
                allowScore = false;
                score += " Siz baho olmagansiz!";
            } else if ("3-qaytnoma".equals(sheet.getQaytnoma())) {
                allowScore = false;
                score += " Siz 3-qaydnoma bilan baho olgansiz!";
            }

            if (Boolean.TRUE.equals(sheet.getScoreSheetGroup().getIsKursIshi())) {
                Integer kursIshi = sheet.getKursIshi();
                if (kursIshi == null || kursIshi < 60) {
                    allowScore = false;
                    score += " Kurs ishidan baho 60 dan kam! Siz olgan baho: " + kursIshi;
                }
            }
        }

        // =============================
        // 📌 OFFICE CHECK
        // =============================
        if (Boolean.TRUE.equals(sheet.getGetIsOffice())) {
            allowOffice = false;
            officeDescription = sheet.getOfficeDescription();
        }

        return new NbCheckResultAndScore(
                allow,
                information,
                allowScore,
                score,
                allowOffice,
                officeDescription
        );
    }


    // ======================================
    // 💵 CONTRACT CHECK
    // ======================================
    private ContractCheckResult checkContract(Student student, Integer requiredPercent) {

        // =============================
        // 🔍 KAFOLAT XATI CHECK
        // =============================
        Optional<KafolatXati> kafolatOpt =
                kafolatXatiRepo.findTopByStudent_IdOrderByIdDesc(student.getId());

        if (kafolatOpt.isPresent()) {
            KafolatXati kafolat = kafolatOpt.get();

            // 1️⃣ status TRUE bo‘lsa
            if (Boolean.TRUE.equals(kafolat.getStatus())) {

                // 2️⃣ muddati o‘tmagan bo‘lsa
                if (kafolat.getDate() != null &&
                        LocalDateTime.now().isBefore(kafolat.getDate().atStartOfDay())) {

                    // 🔥 KONTRAKT CHEKLOVI OLIB TASHLANADI
                    return new ContractCheckResult(true, "");
                }
            } else {
                // ❌ status FALSE bo‘lsa
                return new ContractCheckResult(
                        false,
                        "Admin tomonidan tasdiqlanmagan!"
                );
            }
        }

        // =============================
        // 🔽 ODDIY KONTRAKT LOGIKASI
        // =============================

        Long id = Long.parseLong(student.getStudentIdNumber());
        Optional<Contract> opt = contractRepo.findByHemisNumber(id);

        if (opt.isEmpty()) {
            return new ContractCheckResult(false, "Kontrakt topilmadi");
        }

        if (student.getPaymentForm().equals("Davlat granti")) {
            return new ContractCheckResult(true, "");
        }

        Contract c = opt.get();
        int originalAmount = c.getAmount();
        int totalAmount = originalAmount;
        int discountValue = 0;

        Optional<DiscountStudent> ds =
                discountStudentRepo.findByPassportPin(c.getPassportNumber());

        if (ds.isPresent()) {
            for (DiscountByYear by : ds.get().getDiscountByYear()) {
                if (by.getName().equals("2025-2026")) {
                    discountValue = by.getDiscount();
                    totalAmount = originalAmount - discountValue;
                }
            }
        }

        if (totalAmount == 0) {
            return new ContractCheckResult(true, "");
        }

        double paidPercent = 100.0 * c.getPayment() / totalAmount;

        if (paidPercent >= requiredPercent) {
            return new ContractCheckResult(true, "");
        }

        StringBuilder info = new StringBuilder();

        if (discountValue > 0) {
            info.append("2025-2026 yil uchun ").append(discountValue)
                    .append(" so‘m chegirma berilgan.\n")
                    .append("Chegirmadan keyingi kontrakt summasi: ")
                    .append(totalAmount).append(" so‘m.\n");
        } else {
            info.append("Kontrakt summasi: ")
                    .append(originalAmount).append(" so‘m.\n");
        }

        info.append("To‘langan summa: ")
                .append(c.getPayment()).append(" so‘m.\n")
                .append("To‘lov foizi: ")
                .append(String.format("%.2f", paidPercent))
                .append("%.\n")
                .append("Siz kamida ")
                .append(requiredPercent)
                .append("% to‘lov qilishingiz kerak.");

        return new ContractCheckResult(false, info.toString());
    }
    // ======================================
    // DTO CLASSES
    // ======================================
    @Data
    @AllArgsConstructor
    private static class ContractCheckResult {
        private boolean allow;
        private String information;
    }

    @Data
    @AllArgsConstructor
    private static class NbCheckResultAndScore {
        private boolean allow;               // NB is OK
        private String information;          // NB message
        private boolean allowScore;          // scores OK
        private String score;                // score message
        private boolean allowOffice;         // office block status
        private String officeDescription;    // office explanation
    }


    @Data
    @AllArgsConstructor
    private static class FinalResult {
        private UUID studentId;
        private String fullName;
        private boolean finalPermission;
        private String contractInfo;
        private String nbInfo;
        private String scoreInfo;
        private String officeDescription;
    }
}