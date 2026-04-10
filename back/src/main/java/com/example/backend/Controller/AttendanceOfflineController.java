package com.example.backend.Controller;

import com.example.backend.DTO.AttendanceDTO;
import com.example.backend.DTO.AttendanceOfflineDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Services.ExternalApiService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.*;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/attendance-offline")
public class AttendanceOfflineController {

    private final AttendanceOfflineRepo attendanceOfflineRepo;
    private final TokenHemisRepo tokenHemisRepo;
    private final StudentRepo studentRepo;
    private final ExternalApiService externalApiService;
    private final GroupsRepo groupsRepo;
    private final ScheduleListRepo scheduleListRepo;
    private final AttachmentRepo attachmentRepo;

    @GetMapping("/offline/{scheduleListId}")
    public HttpEntity<?> getOffline(@PathVariable UUID scheduleListId){
        List<AttendanceOffline> all = attendanceOfflineRepo.findAllByScheduleListId(scheduleListId);
        return ResponseEntity.ok(all);
    }


    @GetMapping("/offline-student/{studentId}")
    public HttpEntity<?> getOfflineStudent(@PathVariable UUID studentId){
        List<AttendanceOffline> byStudentId = attendanceOfflineRepo.findByStudentId(studentId);
        return ResponseEntity.ok(byStudentId);
    }




    @PutMapping("/{attendanceOfflineId}")
    public ResponseEntity<?> changeStatus(
            @PathVariable UUID attendanceOfflineId,
            @RequestBody AttendanceOfflineDTO dto
    ) {

        Optional<AttendanceOffline> optional = attendanceOfflineRepo.findById(attendanceOfflineId);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AttendanceOffline attendance = optional.get();

    /* ===============================
       STATUS
    =============================== */
        if (dto.getIsPresent() != null) {
            attendance.setIsPresent(dto.getIsPresent());
//            if (dto.getIsPresent()!=0 && dto.getIsPresent()!=2) {
//                attendance.setIsLate(false);
//            }
        }

    /* ===============================
       COMMENT
    =============================== */
        if (dto.getComment() != null) {
            attendance.setComment(dto.getComment());
        }

    /* ===============================
       MARKED TIME
    =============================== */
        attendance.setTime(LocalDateTime.now());

    /* ===============================
       WHO MARKED (STUDENT)
    =============================== */
        if (dto.getStudentId() != null) {
            studentRepo.findById(dto.getStudentId())
                    .ifPresent(attendance::setMarkedStudent);
        }

    /* ===============================
       WHO MARKED (USER / TEACHER)
    =============================== */
        if (dto.getUserId() != null) {
            User user = new User();
            user.setId(dto.getUserId());
            attendance.setMarkedUser(user);
            // agar UserRepo bo‘lsa → findById qilib qo‘yish ham mumkin
        }

    /* ===============================
       ATTACHMENT (SABABLI BO‘LSA)
    =============================== */
        if (dto.getAttachmentId() != null) {
            Attachment attachment = attachmentRepo.findById(dto.getAttachmentId()).orElseThrow();
            attendance.setFile(attachment);
        }


        attendanceOfflineRepo.save(attendance);
        ScheduleList scheduleList = attendance.getScheduleList();
        if (attendance.getStudent().getIsOnline()==null){
            scheduleList.setIsChecked(2);
        }else {
            scheduleList.setIsOnlineChecked(2);
        }
        scheduleListRepo.save(scheduleList);

        return ResponseEntity.ok(attendance);
    }


    @GetMapping("/online")
    public HttpEntity<?> getOnlineStudents(){
        List<AttendanceOffline> attendanceOfflines = attendanceOfflineRepo.finnAllByTodaysTimestempAndStudentIsOnline(todayTimestampGmt0());
        return ResponseEntity.ok(attendanceOfflines);
    }

    @GetMapping("/laters")
    public HttpEntity<?> getLatersStudents(){
        List<AttendanceOffline> attendanceOfflineList= attendanceOfflineRepo.findByIsLate(true);
        if (attendanceOfflineList.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(attendanceOfflineList);
    }

    @PutMapping("/later/{attendanceOfflineId}")
    public ResponseEntity<?> laterStudents(
            @PathVariable UUID attendanceOfflineId,
            @RequestBody AttendanceOfflineDTO dto
    ) {

        Optional<AttendanceOffline> attendanceOfflineOptional =
                attendanceOfflineRepo.findByIdAndStudentId(
                        attendanceOfflineId,
                        dto.getStudentId()
                );

        if (attendanceOfflineOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AttendanceOffline attendance = attendanceOfflineOptional.get();
        attendance.setIsPresent(2);
        attendance.setIsLate(true);
        attendance.setLateTime(LocalDateTime.now());

        AttendanceOffline save = attendanceOfflineRepo.save(attendance);

        return ResponseEntity.ok(save);
    }

//    @GetMapping("/schedule-list/online/{date}")
//    public ResponseEntity<?> getOnlineSchedules( @PathVariable(required = false) LocalDate date) {
//        LocalDate targetDate = (date != null) ? date : LocalDate.now();
//        long startOfDayUtc = targetDate
//                .atStartOfDay(ZoneId.of("UTC"))
//                .toEpochSecond();
//
//        String lessonDateTimestamp = String.valueOf(startOfDayUtc);
//
//
//        System.out.println(lessonDateTimestamp);
//        List<ScheduleList> schedules =
//                scheduleListRepo.findScheduleListsWithOnlineStudents(lessonDateTimestamp);
//
//        System.out.println(schedules);
//        return ResponseEntity.ok(schedules);
//    }


    @GetMapping("/schedule-list/online/{date}")
    public ResponseEntity<?> getOnlineSchedules(
            @PathVariable(required = false) LocalDate date
    ) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        long startOfDayUtc = targetDate
                .atStartOfDay(ZoneId.of("UTC"))
                .toEpochSecond();

        String lessonDateTimestamp = String.valueOf(startOfDayUtc);

        List<ScheduleList> schedules =
                scheduleListRepo.findScheduleListsWithTodayOnlineStudents(
                        lessonDateTimestamp
                );

        return ResponseEntity.ok(schedules);
    }

    private String todayTimestampGmt0() {
        long startOfDayUtc = LocalDate.now(ZoneId.of("UTC"))
                .atStartOfDay(ZoneId.of("UTC"))
                .toEpochSecond();

        return String.valueOf(startOfDayUtc);
    }


    @PostMapping("/report")
    public ResponseEntity<byte[]> downloadAttendanceReport(
            @RequestBody AttendanceOfflineDTO dto
    ) throws Exception {

        UUID groupId = dto.getGroupId();
        LocalDate from = dto.getFromDate();
        LocalDate to = dto.getToDate();

        if (groupId == null || from == null || to == null)
            return ResponseEntity.badRequest().build();

        Groups group = groupsRepo.findById(groupId).orElse(null);
        if (group == null) return ResponseEntity.badRequest().build();

        List<Student> students = studentRepo.findByGroupId(groupId);
        if (students.isEmpty()) return ResponseEntity.noContent().build();

        List<UUID> studentIds = students.stream().map(Student::getId).toList();

        long fromTs = from.atStartOfDay(ZoneId.of("UTC")).toEpochSecond();
        long toTs   = to.atTime(23, 59, 59).atZone(ZoneId.of("UTC")).toEpochSecond();

        List<AttendanceOffline> attendances = attendanceOfflineRepo.findByStudentsAndDateRange(
                studentIds, from.atStartOfDay(), to.atTime(23, 59, 59));

        List<ScheduleList> schedules = scheduleListRepo.findByGroupAndDateRange(
                groupId, String.valueOf(fromTs), String.valueOf(toTs));

        schedules.sort(Comparator.comparing(ScheduleList::getLessonDate)
                .thenComparing(ScheduleList::getStart_time));

        Map<LocalDate, List<ScheduleList>> schedulesByDate = new LinkedHashMap<>();
        for (ScheduleList schedule : schedules) {
            LocalDate lessonDate = Instant.ofEpochSecond(Long.parseLong(schedule.getLessonDate()))
                    .atZone(ZoneId.of("UTC")).toLocalDate();
            schedulesByDate.computeIfAbsent(lessonDate, k -> new ArrayList<>()).add(schedule);
        }

        Map<String, AttendanceOffline> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        a -> a.getStudent().getId() + "_" + a.getScheduleList().getId(),
                        a -> a, (a1, a2) -> a1));

        Map<UUID, int[]> scheduleStats = new LinkedHashMap<>();
        for (List<ScheduleList> list : schedulesByDate.values())
            for (ScheduleList s : list)
                scheduleStats.put(s.getId(), new int[4]);

        int totalScheduleColumns = schedulesByDate.values().stream().mapToInt(List::size).sum();
        int totalColumns = 3 + totalScheduleColumns + 5;

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Davomat");
            sheet.setDisplayGridlines(false); // gridlines o'chirish — toza ko'rinish

            // ═══════════════════════════════════════════════════
            // RANGLAR (RGB)
            // ═══════════════════════════════════════════════════
            // Sarlavha: to'q ko'k
            byte[] TITLE_BG    = {(byte)0x1F, (byte)0x4E, (byte)0x79};
            // Sub sarlavha: ko'k
            byte[] SUBHDR_BG   = {(byte)0x2E, (byte)0x75, (byte)0xB6};
            // Ustun header: havorang
            byte[] HEADER_BG   = {(byte)0x41, (byte)0x72, (byte)0xC4};
            // Juft qator: och ko'k
            byte[] ALT_ROW_BG  = {(byte)0xD6, (byte)0xE4, (byte)0xF7};
            // Oq
            byte[] WHITE        = {(byte)0xFF, (byte)0xFF, (byte)0xFF};
            // Keldi: yashil
            byte[] BOR_BG      = {(byte)0xC6, (byte)0xEF, (byte)0xCE};
            byte[] BOR_FG      = {(byte)0x27, (byte)0x62, (byte)0x21};
            // Yo'q: qizil
            byte[] YOQ_BG      = {(byte)0xFF, (byte)0xC7, (byte)0xCE};
            byte[] YOQ_FG      = {(byte)0x9C, (byte)0x00, (byte)0x06};
            // Sababli: sariq
            byte[] SAB_BG      = {(byte)0xFF, (byte)0xEB, (byte)0x9C};
            byte[] SAB_FG      = {(byte)0x9C, (byte)0x57, (byte)0x00};
            // Belgilanmagan: kulrang
            byte[] BEL_BG      = {(byte)0xF2, (byte)0xF2, (byte)0xF2};
            byte[] BEL_FG      = {(byte)0x59, (byte)0x59, (byte)0x59};
            // Jami qatori: to'q kulrang
            byte[] TOTAL_BG    = {(byte)0xD9, (byte)0xD9, (byte)0xD9};
            // Foiz qatori: och sariq
            byte[] PERCENT_BG  = {(byte)0xFF, (byte)0xF2, (byte)0xCC};

            // ═══════════════════════════════════════════════════
            // STYLE FACTORY
            // ═══════════════════════════════════════════════════
            CellStyle titleStyle    = makeTitleStyle(workbook, TITLE_BG, WHITE, (short)16, true);
            CellStyle subHdrStyle   = makeTitleStyle(workbook, SUBHDR_BG, WHITE, (short)12, true);
            CellStyle headerStyle   = makeHeaderStyle(workbook, HEADER_BG, WHITE);
            CellStyle normalStyle   = makeDataStyle(workbook, WHITE, false);
            CellStyle altStyle      = makeDataStyle(workbook, ALT_ROW_BG, false);
            CellStyle onlineNormal  = makeDataStyle(workbook, WHITE, false);
            CellStyle onlineAlt     = makeDataStyle(workbook, ALT_ROW_BG, false);
            CellStyle borStyle      = makeStatusStyle(workbook, BOR_BG, BOR_FG);
            CellStyle yoqStyle      = makeStatusStyle(workbook, YOQ_BG, YOQ_FG);
            CellStyle sababliStyle  = makeStatusStyle(workbook, SAB_BG, SAB_FG);
            CellStyle belStyle      = makeStatusStyle(workbook, BEL_BG, BEL_FG);
            CellStyle totalLabelStyle = makeTotalLabelStyle(workbook, TOTAL_BG);
            CellStyle totalNumStyle   = makeTotalNumStyle(workbook, TOTAL_BG);
            CellStyle percentLabelStyle = makeTotalLabelStyle(workbook, PERCENT_BG);
            CellStyle percentNumStyle   = makePercentNumStyle(workbook, PERCENT_BG);

            int rowIndex = 0;

            // ── 1-qator: Asosiy sarlavha ──────────────────────────────────
            Row titleRow = sheet.createRow(rowIndex++);
            titleRow.setHeightInPoints(40);
            Cell tc = titleRow.createCell(0);
            tc.setCellValue(group.getName() + " guruhi  |  " + from + "  –  " + to + "  |  Davomat monitoringi");
            tc.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalColumns - 1));

            // ── Bo'sh qator ───────────────────────────────────────────────
            rowIndex++;

            // ── Header qatorlari ──────────────────────────────────────────
            Row dateRow    = sheet.createRow(rowIndex);
            Row subjectRow = sheet.createRow(rowIndex + 1);
            dateRow.setHeightInPoints(22);
            subjectRow.setHeightInPoints(22);

            setCell(dateRow, 0, "T/R",          headerStyle);
            setCell(dateRow, 1, "F.I.SH",       headerStyle);
            setCell(dateRow, 2, "O'qish holati", headerStyle);
            setCell(subjectRow, 0, "", headerStyle);
            setCell(subjectRow, 1, "", headerStyle);
            setCell(subjectRow, 2, "", headerStyle);

            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex + 1, 0, 0));
            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex + 1, 1, 1));
            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex + 1, 2, 2));

            int col = 3;
            for (Map.Entry<LocalDate, List<ScheduleList>> entry : schedulesByDate.entrySet()) {
                int startCol = col;
                for (ScheduleList schedule : entry.getValue()) {
                    setCell(subjectRow, col++, schedule.getSubject().getName(), headerStyle);
                }
                if (col - 1 > startCol)
                    sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, startCol, col - 1));
                setCell(dateRow, startCol, entry.getKey().toString(), headerStyle);
            }

            // Jami ustunlari
            int jamiStartCol = col;
            setCell(dateRow, jamiStartCol, "JAMI", subHdrStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, jamiStartCol, jamiStartCol + 3));
            setCell(subjectRow, jamiStartCol,     "Bor",           headerStyle);
            setCell(subjectRow, jamiStartCol + 1, "Yo'q",          headerStyle);
            setCell(subjectRow, jamiStartCol + 2, "Sababli",       headerStyle);
            setCell(subjectRow, jamiStartCol + 3, "Belgilanmagan", headerStyle);
            setCell(subjectRow, jamiStartCol + 4, "Yo'q %",        headerStyle);

            rowIndex += 2;

            // ── Talaba qatorlari ──────────────────────────────────────────
            int order = 1;
            for (int si = 0; si < students.size(); si++) {
                Student student = students.get(si);
                boolean alt = (si % 2 != 0);
                CellStyle rowStyle = alt ? altStyle : normalStyle;

                Row row = sheet.createRow(rowIndex++);
                row.setHeightInPoints(20);

                setCellNum(row, 0, order++, rowStyle);
                setCell(row, 1, student.getFullName(), rowStyle);

                // Online/Offline rangli
                boolean isOnline = Boolean.TRUE.equals(student.getIsOnline());
                CellStyle olStyle = makeStatusStyle(workbook,
                        isOnline ? new byte[]{(byte)0xD9, (byte)0xF0, (byte)0xFF} : new byte[]{(byte)0xFF, (byte)0xE5, (byte)0xD0},
                        isOnline ? new byte[]{(byte)0x00, (byte)0x56, (byte)0x8A} : new byte[]{(byte)0x7F, (byte)0x32, (byte)0x00});
                setCell(row, 2, isOnline ? "Online" : "Offline", olStyle);

                int totalBor = 0, totalYoq = 0, totalSababli = 0, totalBelgilanmagan = 0;
                col = 3;

                for (Map.Entry<LocalDate, List<ScheduleList>> entry : schedulesByDate.entrySet()) {
                    for (ScheduleList schedule : entry.getValue()) {
                        String key = student.getId() + "_" + schedule.getId();
                        AttendanceOffline attendance = attendanceMap.get(key);
                        int[] stats = scheduleStats.get(schedule.getId());

                        String value;
                        CellStyle valStyle;
                        if (attendance != null && attendance.getIsPresent() != null) {
                            switch (attendance.getIsPresent()) {
                                case 1  -> { value = "Bor";           valStyle = borStyle;     totalBor++;           stats[0]++; }
                                case 2  -> { value = "Yo'q";          valStyle = yoqStyle;     totalYoq++;           stats[1]++; }
                                case 3  -> { value = "Sababli";       valStyle = sababliStyle; totalSababli++;       stats[2]++; }
                                default -> { value = "Belgilanmagan"; valStyle = belStyle;     totalBelgilanmagan++; stats[3]++; }
                            }
                        } else {
                            value = "Belgilanmagan"; valStyle = belStyle; totalBelgilanmagan++; stats[3]++;
                        }
                        setCell(row, col++, value, valStyle);
                    }
                }

                int borCol = col, yoqCol = col+1, sababliCol = col+2, belCol = col+3;
                setCellNum(row, borCol,     totalBor,           rowStyle);
                setCellNum(row, yoqCol,     totalYoq,           rowStyle);
                setCellNum(row, sababliCol, totalSababli,       rowStyle);
                setCellNum(row, belCol,     totalBelgilanmagan, rowStyle);

                int r = row.getRowNum() + 1;
                Cell pct = row.createCell(belCol + 1);
                pct.setCellStyle(percentNumStyle);  // ← percentNumStyle
                pct.setCellFormula(
                        getExcelColumnName(yoqCol) + r + "*100/(" +
                                getExcelColumnName(borCol) + r + "+" +
                                getExcelColumnName(yoqCol) + r + "+" +
                                getExcelColumnName(sababliCol) + r + "+" +
                                getExcelColumnName(belCol) + r + ")"
                );
            }

            // ── Fan bo'yicha jami ─────────────────────────────────────────
            rowIndex++;
            String[] totalLabels = {
                    "Fan bo'yicha jami BOR",
                    "Fan bo'yicha jami YO'Q",
                    "Fan bo'yicha jami SABABLI",
                    "Fan bo'yicha jami BELGILANMAGAN",
                    "Fan bo'yicha YO'Q %"
            };
            CellStyle[] totalStyles = {borStyle, yoqStyle, sababliStyle, belStyle, percentNumStyle};

            Row[] statRows = new Row[5];
            for (int i = 0; i < 5; i++) {
                statRows[i] = sheet.createRow(rowIndex++);
                statRows[i].setHeightInPoints(20);
                setCell(statRows[i], 0, "",               totalLabelStyle);
                setCell(statRows[i], 1, totalLabels[i],   totalLabelStyle);
                setCell(statRows[i], 2, "",               totalLabelStyle);
                sheet.addMergedRegion(new CellRangeAddress(
                        statRows[i].getRowNum(), statRows[i].getRowNum(), 1, 2));
            }

            col = 3;
            for (Map.Entry<LocalDate, List<ScheduleList>> entry : schedulesByDate.entrySet()) {
                for (ScheduleList schedule : entry.getValue()) {
                    int[] stats = scheduleStats.getOrDefault(schedule.getId(), new int[4]);
                    int total   = stats[0] + stats[1] + stats[2] + stats[3];
                    double pct = total == 0 ? 0 : ((double) stats[1] / total) * 100;

                    setCellNum(statRows[0], col, stats[0], borStyle);
                    setCellNum(statRows[1], col, stats[1], yoqStyle);
                    setCellNum(statRows[2], col, stats[2], sababliStyle);
                    setCellNum(statRows[3], col, stats[3], belStyle);
                    setCellDbl(statRows[4], col, pct,      percentNumStyle);
                    col++;
                }
            }

            // ── Ustun kengliklari ─────────────────────────────────────────
            sheet.setColumnWidth(0, 2500);   // T/R
            sheet.setColumnWidth(1, 10000);  // F.I.SH
            sheet.setColumnWidth(2, 4500);   // O'qish holati
            for (int i = 3; i < totalColumns; i++) {
                sheet.setColumnWidth(i, 4200);
            }

            // ── Freeze ───────────────────────────────────────────────────
            sheet.createFreezePane(3, 4);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("Davomat_" + group.getName() + ".xlsx").build());

            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);
        }
    }

// ═══════════════════════════════════════════════════════════
// STYLE BUILDER METODLAR
// ═══════════════════════════════════════════════════════════

    private BorderStyle THIN  = BorderStyle.THIN;
    private BorderStyle MEDIUM = BorderStyle.MEDIUM;

    private void applyBorder(CellStyle s, BorderStyle bs) {
        s.setBorderTop(bs); s.setBorderBottom(bs);
        s.setBorderLeft(bs); s.setBorderRight(bs);
    }

    private XSSFColor rgb(XSSFWorkbook wb, byte[] rgb) {
        return new XSSFColor(rgb, null);
    }

    /** Sarlavha style */
    private CellStyle makeTitleStyle(XSSFWorkbook wb, byte[] bg, byte[] fg, short size, boolean bold) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, MEDIUM);
        XSSFFont f = wb.createFont();
        f.setBold(bold); f.setFontHeightInPoints(size);
        f.setColor(new XSSFColor(fg, null)); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Ustun header style */
    private CellStyle makeHeaderStyle(XSSFWorkbook wb, byte[] bg, byte[] fg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        s.setWrapText(true);
        applyBorder(s, MEDIUM);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short)10);
        f.setColor(new XSSFColor(fg, null)); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Ma'lumot qatori style */
    private CellStyle makeDataStyle(XSSFWorkbook wb, byte[] bg, boolean bold) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, THIN);
        XSSFFont f = wb.createFont();
        f.setBold(bold); f.setFontHeightInPoints((short)10); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Holat (Bor/Yo'q/Sababli) style */
    private CellStyle makeStatusStyle(XSSFWorkbook wb, byte[] bg, byte[] fg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, THIN);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short)10);
        f.setColor(new XSSFColor(fg, null)); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Jami label style */
    private CellStyle makeTotalLabelStyle(XSSFWorkbook wb, byte[] bg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.LEFT);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, THIN);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short)10); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Jami raqam style */
    private CellStyle makeTotalNumStyle(XSSFWorkbook wb, byte[] bg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, THIN);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short)10); f.setFontName("Arial");
        s.setFont(f);
        return s;
    }

    /** Foiz style */
    private CellStyle makePercentNumStyle(XSSFWorkbook wb, byte[] bg) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(new XSSFColor(bg, null));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        applyBorder(s, THIN);
        XSSFFont f = wb.createFont();
        f.setBold(true); f.setFontHeightInPoints((short)10); f.setFontName("Arial");
        s.setFont(f);
        s.setDataFormat(wb.createDataFormat().getFormat("0\"%\""));  // 30 → "30%"
        return s;
    }

// ── Cell yozish yordamchi metodlar ───────────────────────────────────

    private void setCell(Row row, int col, String value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value); c.setCellStyle(style);
    }

    private void setCellNum(Row row, int col, int value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value); c.setCellStyle(style);
    }

    private void setCellDbl(Row row, int col, double value, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(value); c.setCellStyle(style);
    }

    private String getExcelColumnName(int columnNumber) {
        int dividend = columnNumber + 1;
        StringBuilder columnName = new StringBuilder();
        while (dividend > 0) {
            int modulo = (dividend - 1) % 26;
            columnName.insert(0, (char)(65 + modulo));
            dividend = (dividend - modulo) / 26;
        }
        return columnName.toString();
    }


    @PostMapping("/report/all")
    public ResponseEntity<byte[]> downloadAllReport(
            @RequestBody AttendanceOfflineDTO dto
    ) throws Exception {

        LocalDate from = dto.getFromDate();
        LocalDate to   = dto.getToDate();



        if (from == null || to == null) {
            return ResponseEntity.badRequest().build();
        }

        long fromTs = from.atStartOfDay(ZoneId.of("UTC")).toEpochSecond();
        long toTs   = to.atTime(23, 59, 59).atZone(ZoneId.of("UTC")).toEpochSecond();


        List<AttendanceOffline> attendances;
        try {
            attendances = attendanceOfflineRepo.findAllByTimestampRange(
                    String.valueOf(fromTs),
                    String.valueOf(toTs)
            );
        } catch (Exception e) {
            System.out.println("❌ DB XATOLIK: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        if (attendances.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        Workbook workbook = new XSSFWorkbook();
        try {
            Sheet sheet = workbook.createSheet("Davomat");

            CellStyle titleStyle    = createTitleStyle(workbook, IndexedColors.DARK_BLUE);
            CellStyle subTitleStyle = createTitleStyle(workbook, IndexedColors.CORNFLOWER_BLUE);
            CellStyle headerStyle   = createHeaderStyle(workbook);
            CellStyle normalStyle   = createBorderedStyle(workbook, false);
            CellStyle altStyle      = createBorderedStyle(workbook, true);
            CellStyle presentStyle  = createColoredStyle(workbook, IndexedColors.LIGHT_GREEN,     IndexedColors.DARK_GREEN);
            CellStyle absentStyle   = createColoredStyle(workbook, IndexedColors.ROSE,            IndexedColors.DARK_RED);
            CellStyle excusedStyle  = createColoredStyle(workbook, IndexedColors.LIGHT_YELLOW,    IndexedColors.DARK_YELLOW);
            CellStyle unknownStyle  = createColoredStyle(workbook, IndexedColors.GREY_25_PERCENT, IndexedColors.GREY_50_PERCENT);
            CellStyle onlineStyle   = createColoredStyle(workbook, IndexedColors.LIGHT_TURQUOISE, IndexedColors.DARK_TEAL);
            CellStyle offlineStyle  = createColoredStyle(workbook, IndexedColors.TAN,             IndexedColors.BROWN);

            int rowIdx    = 0;
            // № | Talaba ismi | Telefon | O'qish holati | Guruh | Davomat holati | Fan nomi | Sana | Izoh
            int totalCols = 9;

            // ── 1-qator: Sarlavha ────────────────────────────────────────────
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.setHeightInPoints(36);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("DAVOMAT HISOBOTI");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalCols - 1));

            // ── 2-qator: Sana oralig'i ───────────────────────────────────────
            Row dateRow2 = sheet.createRow(rowIdx++);
            dateRow2.setHeightInPoints(24);
            Cell dateCell = dateRow2.createCell(0);
            dateCell.setCellValue("Tanlangan sana:  " + from + "  →  " + to);
            dateCell.setCellStyle(subTitleStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, totalCols - 1));

            // ── 3-qator: Ustun sarlavhalari ──────────────────────────────────
            Row headerRow = sheet.createRow(rowIdx++);
            headerRow.setHeightInPoints(28);

            //                       0    1              2                3               4        5                 6           7       8
            String[] headers = {"№", "Talaba ismi", "Telefon raqami", "O'qish holati", "Guruh", "Davomat holati", "Fan nomi", "Sana", "Izoh"};
            int[]    widths  = {2000, 8500,           5000,             4500,            6000,    4500,              7000,      4000,   7000};

            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, widths[i]);
            }
            sheet.createFreezePane(0, 3);

            // ── Ma'lumot qatorlari ───────────────────────────────────────────
            int order = 1;
            for (int i = 0; i < attendances.size(); i++) {
                AttendanceOffline a = attendances.get(i);
                try {
                    boolean isAlt = (i % 2 == 0);
                    Row row = sheet.createRow(rowIdx++);
                    row.setHeightInPoints(20);

                    // № (0)
                    createStyledCell(row, 0, String.valueOf(order++), isAlt ? altStyle : normalStyle);

                    // Talaba ismi (1) va Telefon (2)
                    String fullName = "-";
                    String phone    = "-";
                    if (a.getStudent() != null) {
                        fullName = a.getStudent().getFullName() != null ? a.getStudent().getFullName() : "-";
                        phone    = a.getStudent().getPhone()    != null ? a.getStudent().getPhone()    : "-";
                    }
                    createStyledCell(row, 1, fullName, isAlt ? altStyle : normalStyle);
                    createStyledCell(row, 2, phone,    isAlt ? altStyle : normalStyle);

                    // O'qish holati: Online / Offline (3)
                    boolean isOnline = a.getStudent() != null && Boolean.TRUE.equals(a.getStudent().getIsOnline());
                    String  onlineText  = isOnline ? "Online" : "Offline";
                    CellStyle onlineStatusStyle = isOnline ? onlineStyle : offlineStyle;
                    createStyledCell(row, 3, onlineText, onlineStatusStyle);

                    // Guruh nomi (4)
                    String groupName = "-";
                    if (a.getStudent() != null && a.getStudent().getGroup() != null) {
                        groupName = a.getStudent().getGroup().getName() != null
                                ? a.getStudent().getGroup().getName() : "-";
                    }
                    createStyledCell(row, 4, groupName, isAlt ? altStyle : normalStyle);

                    // Davomat holati (5)
                    Integer status = a.getIsPresent();
                    CellStyle statusStyle = switch (status == null ? -1 : status) {
                        case 1  -> presentStyle;
                        case 2  -> absentStyle;
                        case 3  -> excusedStyle;
                        default -> unknownStyle;
                    };
                    String statusText = switch (status == null ? -1 : status) {
                        case 1  -> "BOR";
                        case 2  -> "YO'Q";
                        case 3  -> "SABABLI";
                        default -> "BELGILANMAGAN";
                    };
                    createStyledCell(row, 5, statusText, statusStyle);

                    // Fan nomi (6)
                    String subjectName = "-";
                    if (a.getScheduleList() != null) {
                        if (a.getScheduleList().getSubject() != null) {
                            subjectName = a.getScheduleList().getSubject().getName();
                        }
                    }
                    createStyledCell(row, 6, subjectName, isAlt ? altStyle : normalStyle);

                    // Sana (7)
                    String dateStr = "-";
                    if (a.getScheduleList() != null && a.getScheduleList().getLessonDate() != null) {
                        try {
                            LocalDate lessonDate = Instant
                                    .ofEpochSecond(Long.parseLong(a.getScheduleList().getLessonDate()))
                                    .atZone(ZoneId.of("UTC"))
                                    .toLocalDate();
                            dateStr = lessonDate.toString();
                        } catch (Exception ex) {
                            System.out.println("⚠️ [" + i + "] lessonDate parse xatolik: "
                                    + a.getScheduleList().getLessonDate() + " → " + ex.getMessage());
                        }
                    }
                    createStyledCell(row, 7, dateStr, isAlt ? altStyle : normalStyle);

                    // Izoh (8)
                    createStyledCell(row, 8,
                            a.getComment() != null ? a.getComment() : "",
                            isAlt ? altStyle : normalStyle);

                } catch (Exception rowEx) {
                    System.out.println("❌ [" + i + "] QATOR XATOLIK: " + rowEx.getMessage());
                    rowEx.printStackTrace();
                }
            }

            // ── Jami qatori ──────────────────────────────────────────────────
            rowIdx++;
            Row totalRow = sheet.createRow(rowIdx);
            totalRow.setHeightInPoints(24);
            Cell totalCell = totalRow.createCell(0);
            totalCell.setCellValue("Jami yozuvlar: " + attendances.size());
            totalCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, totalCols - 1));

            // ── Faylni yozish ─────────────────────────────────────────────────
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            String filename = "Davomat_" + from + "_" + to + ".xlsx";
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            httpHeaders.setContentDisposition(
                    ContentDisposition.attachment().filename(filename).build());

            return new ResponseEntity<>(out.toByteArray(), httpHeaders, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("❌ EXCEL YARATISHDA XATOLIK: " + e.getMessage());
            e.printStackTrace();
            workbook.close();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
// ─── Yordamchi metodlar (controller oxiriga qo'shing) ────────────────

    private void createStyledCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private CellStyle createTitleStyle(Workbook wb, IndexedColors bgColor) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(bgColor.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontName("Arial");
        style.setFont(font);
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontName("Arial");
        style.setFont(font);
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        return style;
    }

    private CellStyle createBorderedStyle(Workbook wb, boolean alt) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(alt
                ? IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex()
                : IndexedColors.WHITE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 10);
        font.setFontName("Arial");
        style.setFont(font);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createColoredStyle(Workbook wb, IndexedColors bg, IndexedColors fg) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(bg.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(fg.getIndex());
        font.setFontName("Arial");
        style.setFont(font);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}
