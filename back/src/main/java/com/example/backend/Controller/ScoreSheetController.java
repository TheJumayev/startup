package com.example.backend.Controller;

import com.example.backend.DTO.ScoreSheetDTO;
import com.example.backend.DTO.ScoreSheetWithAttendanceDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/score-sheet")
@RequiredArgsConstructor

public class ScoreSheetController {

    private final ScoreSheetGroupRepo scoreSheetGroupRepo;
    private final ScoreSheetRepo scoreSheetRepo;
    private final GroupsRepo groupsRepo;
    private final RestTemplate restTemplate;
    private final TokenHemisRepo tokenHemisRepo;

    private final UserRepo userRepo;
    private final String baseUrl = "https://student.buxpxti.uz/rest";
    private final StudentRepo studentRepo;
    private final AttachmentRepo attachmentRepo;
    private final MustaqilExamRepo mustaqilExamRepo;
    private final MustaqilTalimStudentRepo mustaqilTalimStudentRepo;

    @GetMapping
    public HttpEntity<?>getAll(){
        List<ScoreSheet> all = scoreSheetRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @PostMapping("/filter")
    public HttpEntity<?> getByFilter(@RequestBody ScoreSheetDTO dto) {

        List<ScoreSheet> result = scoreSheetRepo.filter(
                dto.getStudentId(),
                dto.getSubjectId()
        );

        return ResponseEntity.ok(result);
    }

    @PutMapping("/fall-student/{id}")
    public HttpEntity<?> getFallStudent(@PathVariable UUID id, @RequestBody ScoreSheetDTO dto) {
        Optional<ScoreSheet> scoreSheetOptional = scoreSheetRepo.findById(id);

        if (scoreSheetOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ScoreSheet scoreSheet = scoreSheetOptional.get();
        scoreSheet.setMustaqil(null);
        scoreSheet.setOraliq(null);
        scoreSheet.setIsPassed(null);
        scoreSheetRepo.save(scoreSheet);
        Optional<Student> studentOptional = studentRepo.findById(dto.getStudentId());
        if (studentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student = studentOptional.get();
        Optional<MustaqilTalimStudent> byGroupAndCurriculumAndStudent = mustaqilTalimStudentRepo.findByGroupAndCurriculumAndStudent(student.getGroup().getId(), dto.getSubjectId(), student.getId());
        if (byGroupAndCurriculumAndStudent.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        MustaqilTalimStudent mustaqilTalimStudent = byGroupAndCurriculumAndStudent.get();
        mustaqilTalimStudent.setBall(null);
        mustaqilTalimStudent.setIsPassed(false);
        mustaqilTalimStudentRepo.save(mustaqilTalimStudent);
        return ResponseEntity.ok().build();

    }

    @DeleteMapping("/delete/{scoreSheetId}")
    public HttpEntity<?> delete(@PathVariable UUID scoreSheetId) {
        System.out.println(scoreSheetId);
        Optional<ScoreSheet> opt = scoreSheetRepo.findById(scoreSheetId);
        if (opt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        scoreSheetRepo.deleteById(scoreSheetId);
        return ResponseEntity.ok("Deleted");
    }


    @GetMapping("/rektor/{scoreSheetId}/{status}/{description}")
    public HttpEntity<?> rektor(@PathVariable UUID scoreSheetId, @PathVariable Integer status, @PathVariable String description) {
        Optional<ScoreSheet> opt = scoreSheetRepo.findById(scoreSheetId);
        Student student = opt.get().getStudent();
        List<ScoreSheet> byStudentId = scoreSheetRepo.findByStudentId(student.getId());
        for (ScoreSheet scoreSheet : byStudentId) {
            scoreSheet.setRektor(status==1);
            scoreSheet.setRektorDescription(description);
            scoreSheetRepo.save(scoreSheet);
        }
        return ResponseEntity.ok("Saved");
    }


    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel() {
        List<ScoreSheet> all = scoreSheetRepo.findAll();
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("ScoreSheet");
        // ===== HEADER ROW =====
        String[] headers = {
                "T/R", "Guruh", "Fan", "Ma'ruzachi", "Seminarchi", "Talaba",
                "Ma'ruzadan o'tdi", "Izoh", "Mustaqil bahosi", "Oraliq bahosi",
                "Qaydnoma","Tasdiqladi", "Jami NB", "Sababli NB", "Sababsiz NB","Vaqti"
        };
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            headerRow.createCell(i).setCellValue(headers[i]);
        }
        // ===== DATA ROWS =====
        int rowIndex = 1;

        for (ScoreSheet scoreSheet : all) {

            Row row = sheet.createRow(rowIndex);

            boolean passed = Boolean.TRUE.equals(scoreSheet.getIsPassed());
            String otdi = passed ? "O'tdi" : "O'tmadi";
            String otmadiIzoh = passed ? "" : scoreSheet.getDescription();
            int mustaqil = scoreSheet.getMustaqil() == null ? 0 : scoreSheet.getMustaqil();
            int oraliq = scoreSheet.getOraliq() == null ? 0 : scoreSheet.getOraliq();
            int totalNb = scoreSheet.getTotalNb() == null ? 0 : scoreSheet.getTotalNb();
            int sababliNB = scoreSheet.getSababliNB() == null ? 0 : scoreSheet.getSababliNB();
            int sababsizNB = scoreSheet.getSababsizNb() == null ? 0 : scoreSheet.getSababsizNb();
            row.createCell(0).setCellValue(rowIndex); // T/R
            row.createCell(1).setCellValue(scoreSheet.getScoreSheetGroup().getGroup().getName());
            row.createCell(2).setCellValue(scoreSheet.getScoreSheetGroup().getCurriculumSubject().getSubject().getName());
            row.createCell(3).setCellValue(scoreSheet.getScoreSheetGroup().getLecturer().getName());
            row.createCell(4).setCellValue(scoreSheet.getScoreSheetGroup().getTeacher().getName());
            row.createCell(5).setCellValue(scoreSheet.getStudent().getFullName());
            row.createCell(6).setCellValue(otdi);
            row.createCell(7).setCellValue(otmadiIzoh);
            row.createCell(8).setCellValue(mustaqil);
            row.createCell(9).setCellValue(oraliq);
            row.createCell(10).setCellValue(scoreSheet.getQaytnoma());
            boolean tasdiq = Boolean.TRUE.equals(scoreSheet.getIsAccepted());
            String tas = tasdiq ? "Tasdiqladi" : "Tasdiqlamadi";
            row.createCell(11).setCellValue(tas);
            row.createCell(12).setCellValue(totalNb);
            row.createCell(13).setCellValue(sababliNB);
            row.createCell(14).setCellValue(sababsizNB);
            row.createCell(15).setCellValue(scoreSheet.getUpdatedAt());
            rowIndex++;
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            workbook.write(out);
            workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("Excel yaratishda xatolik!", e);
        }

        HttpHeaders headersExcel = new HttpHeaders();
        headersExcel.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headersExcel.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=score_sheet.xlsx");

        return new ResponseEntity<>(out.toByteArray(), headersExcel, HttpStatus.OK);
    }

    @GetMapping("/get-all")
    public ResponseEntity<?> getAllScoreSheets() {
        List<ScoreSheet> scores = scoreSheetRepo.findAll();
        if (scores.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(scores);
    }

    @PutMapping("/office/{scoreId}/{studentId}")
    public ResponseEntity<?> changeScoreSheetStatus(
            @PathVariable UUID scoreId,
            @PathVariable UUID studentId,
            @RequestBody ScoreSheetDTO dto
    ) {
        Optional<ScoreSheet> opt = scoreSheetRepo.findById(scoreId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("ScoreSheet topilmadi!");
        }
        List<ScoreSheet> scoreSheets = scoreSheetRepo.findByStudentId(studentId);
        Optional<Student> studentOpt = studentRepo.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Talaba topilmadi!");
        }
        for (ScoreSheet scoreSheet : scoreSheets) {
            if (dto.getGetIsOffice() != null) {
                scoreSheet.setGetIsOffice(dto.getGetIsOffice());
            }
            if (dto.getOfficeDescription() != null) {
                scoreSheet.setOfficeDescription(dto.getOfficeDescription());
            }
            ScoreSheet save = scoreSheetRepo.save(scoreSheet);
        }
        return ResponseEntity.ok("Saqlandi");
    }




    //  get , put
@PutMapping("/isPassed/{scoreId}")
public ResponseEntity<?> isPassed(
        @PathVariable UUID scoreId,
        @RequestBody ScoreSheetDTO dto
) {
    ScoreSheet score = scoreSheetRepo.findById(scoreId)
            .orElseThrow(() -> new RuntimeException("Score not found"));

        // TRUE bo'lsa faqat isPassed o‘rnatiladi
        if (dto.getIsPassed() != null) {
            score.setIsPassed(dto.getIsPassed());
        }

        // FALSE bo'lsa description majburiy
        if (Boolean.FALSE.equals(dto.getIsPassed())) {
            score.setDescription(dto.getDescription());
        } else {
            score.setDescription(null);
        }

        scoreSheetRepo.save(score);

    return ResponseEntity.ok("Updated successfully");
}
@GetMapping("/student/{scoreSheetGroupId}")
public ResponseEntity<?> getScoreSheetGroupId(@PathVariable UUID scoreSheetGroupId) {
    Optional<ScoreSheetGroup> byId = scoreSheetGroupRepo.findById(scoreSheetGroupId);
    if (byId.isPresent()) {
        ScoreSheetGroup scoreSheetGroup = byId.get();
        UUID id = scoreSheetGroup.getGroup().getId();
        List<Student> allByGroupId = studentRepo.findAllByGroupId(id);
        return ResponseEntity.ok(allByGroupId);
    }
    return ResponseEntity.notFound().build();
}



    @GetMapping("/lecturer/{scoreSheetId}")
    public HttpEntity<?> getLecturerSetScoreSheet(@PathVariable UUID scoreSheetId, @RequestBody ScoreSheetDTO scoreSheetDTO) {
        Optional<ScoreSheet> byId = scoreSheetRepo.findById(scoreSheetId);
        Optional<User> teacher = userRepo.findById(scoreSheetDTO.getLecturerId());
        if (byId.isPresent() && teacher.isPresent()) {
            ScoreSheet scoreSheet = byId.get();
            scoreSheet.setLecturer(teacher.get());
            scoreSheet.setIsPassed(scoreSheetDTO.getIsPassed());
            scoreSheet.setDescription(scoreSheetDTO.getDescription());
            scoreSheetRepo.save(scoreSheet);
            return new ResponseEntity<>(scoreSheetDTO, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }




    @GetMapping("/{scoreSheetGroupId}")
    public HttpEntity<?> getAllScoreSheetGroup(@PathVariable UUID scoreSheetGroupId) {
        List<ScoreSheet> scoreSheets = scoreSheetRepo.findByScoreSheetGroupId(scoreSheetGroupId);
        return new ResponseEntity<>(scoreSheets, HttpStatus.OK);
    }



    @GetMapping("/nb/{scoreSheetGroupId}")
    public ResponseEntity<?> updateNb(@PathVariable UUID scoreSheetGroupId) {
        List<ScoreSheet> scoreSheets = scoreSheetRepo.findByScoreSheetGroupId(scoreSheetGroupId);
        for (ScoreSheet sheet : scoreSheets) {
            Student student = sheet.getStudent();
            Integer hemisId = student.getHemisId();

            List<Integer> nb = getAttendanceStudentString(
                    sheet.getScoreSheetGroup()
                            .getCurriculumSubject()
                            .getSubject()
                            .getHemisId(),
                    hemisId,
                    sheet.getStudent().getSemester()
            );
            Integer totalNB = nb.get(0);
            Integer sababliNB = nb.get(1);
            Integer sababsizNB = nb.get(2);
            sheet.setTotalNb(totalNB);
            sheet.setSababliNB(sababliNB);
            sheet.setSababsizNb(sababsizNB);
            scoreSheetRepo.save(sheet);
            try {
                Thread.sleep(1000); // 1 sekund pauza
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); // to'g'ri interrupt ishlov
            }
        }
        return ResponseEntity.ok(scoreSheets);
    }
    private List<Integer> getAttendanceStudentString(Integer subjectId, Integer hemisId, String semester) {

        String url = baseUrl + "/v1/data/attendance-list?_subject=" + subjectId + "&_student=" + hemisId+"&_semester="+semester;

        HttpHeaders headers = new HttpHeaders();
        List<TokenHemis> tokens = tokenHemisRepo.findAll();

        String token = tokens.get(tokens.size() - 1).getName();
        headers.setBearerAuth(token);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && (Boolean) body.get("success")) {

                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

                int totalNB = 0;
                int sababliNB = 0;
                int sababsizNB = 0;

                for (Map<String, Object> item : items) {
                    int absentOn = (int) item.get("absent_on");
                    int absentOff = (int) item.get("absent_off");

                    totalNB += absentOff;

                    if (absentOn > 0) {
                        sababliNB += absentOff;
                    } else {
                        sababsizNB += absentOff;
                    }
                }

                return Arrays.asList(totalNB, sababliNB, sababsizNB);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return Arrays.asList(0, 0, 0);
    }

    @GetMapping("/nb/update-all")
    public ResponseEntity<?> updateAllNb() {

        List<ScoreSheetGroup> groups = scoreSheetGroupRepo.findAll();

        for (ScoreSheetGroup group : groups) {

            List<ScoreSheet> scoreSheets =
                    scoreSheetRepo.findByScoreSheetGroupId(group.getId());

            for (ScoreSheet sheet : scoreSheets) {

                Student student = sheet.getStudent();
                Integer hemisId = student.getHemisId();

                Integer subjectId = sheet.getScoreSheetGroup()
                        .getCurriculumSubject()
                        .getSubject()
                        .getHemisId();

                // 🔥 3 MARTALIK RETRY VA 500ms KUTISH BILAN NB OLIB KELADI
                List<Integer> nb = getAttendanceStudentString(subjectId, hemisId, student.getSemester());

                sheet.setTotalNb(nb.get(0));
                sheet.setSababliNB(nb.get(1));
                sheet.setSababsizNb(nb.get(2));

                scoreSheetRepo.save(sheet);

                // 🔵 HEMIS bloklamasligi uchun 500ms kutish
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        return ResponseEntity.ok("Barcha guruhlar uchun NB yangilandi");
    }


    @PutMapping("/{scoreSheetId}")
    public HttpEntity<?> updateScoreSheet(@PathVariable UUID scoreSheetId, @RequestBody ScoreSheetDTO scoreSheetDTO){
        System.out.println("fuck shogird"); //soat 00:45
        Optional<ScoreSheet> byId = scoreSheetRepo.findById(scoreSheetId);
        Optional<User> teacher = userRepo.findById(scoreSheetDTO.getMarkerId());
        if (teacher.isEmpty())return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
        if(byId.isPresent()){
            ScoreSheet scoreSheet = byId.get();
            scoreSheet.setOraliq(scoreSheetDTO.getOraliq());
            scoreSheet.setMustaqil(scoreSheetDTO.getMustaqil());
            scoreSheet.setUpdatedAt(LocalDateTime.now());
            scoreSheet.setMarker(teacher.get());
            scoreSheet.setQaytnoma(scoreSheetDTO.getQaytnoma().toString()+"-qaytnoma");
            if (scoreSheetDTO.getKursIshi()!=null ){
                    scoreSheet.setKursIshi(scoreSheetDTO.getKursIshi());
                    scoreSheet.setKursIshiStatus(true);
            }
            scoreSheetRepo.save(scoreSheet);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/kurs-ishi/{scoreSheetId}")
    public HttpEntity<?> updatekursishiScoreSheet(@PathVariable UUID scoreSheetId, @RequestBody ScoreSheetDTO scoreSheetDTO){
        System.out.println("fuck shogird"); //soat 00:45
        Optional<ScoreSheet> byId = scoreSheetRepo.findById(scoreSheetId);
        Optional<User> teacher = userRepo.findById(scoreSheetDTO.getMarkerId());
        if (teacher.isEmpty())return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
        if(byId.isPresent()){
            ScoreSheet scoreSheet = byId.get();
            scoreSheet.setQaytnoma(scoreSheetDTO.getQaytnoma().toString()+"-qaytnoma");
            if (scoreSheetDTO.getKursIshi()!=null ){
                    scoreSheet.setKursIshi(scoreSheetDTO.getKursIshi());
                    scoreSheet.setKursIshiStatus(true);
            }
            scoreSheetRepo.save(scoreSheet);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }







}
