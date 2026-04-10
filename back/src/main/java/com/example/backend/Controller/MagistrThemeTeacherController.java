package com.example.backend.Controller;

import com.example.backend.DTO.MagistrThemeTeacherDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.MagistrThemeTeacher;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.MagistrThemeTeacherRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/magistr-theme-teacher")
public class MagistrThemeTeacherController {
    private final MagistrThemeTeacherRepo magistrThemeTeacherRepo;
    private final AttachmentRepo attachmentRepo;
    private final StudentRepo studentRepo;
    private final GroupsRepo groupsRepo;

    @PutMapping("/file/{magistrThemeTeacherId}/{fileId}")
    public HttpEntity<?> setFile(@PathVariable UUID magistrThemeTeacherId, @PathVariable UUID fileId) {
        Optional<MagistrThemeTeacher> byId = magistrThemeTeacherRepo.findById(magistrThemeTeacherId);
        MagistrThemeTeacher magistrThemeTeacher = byId.get();
        Optional<Attachment> attachment = attachmentRepo.findById(fileId);
        if (attachment.isPresent()) {
            magistrThemeTeacher.setAttachment(attachment.get());
            magistrThemeTeacherRepo.save(magistrThemeTeacher);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/{fileId}")
    public HttpEntity<?> uploadFile(
            @PathVariable UUID fileId,
            @RequestParam(required = false) UUID groupId // ✅ yangi qo‘shildi
    ) {
        try {
            Optional<Attachment> byId = attachmentRepo.findById(fileId);
            if (byId.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Attachment attachment = byId.get();
            String filePath = "backend/files" + attachment.getPrefix() + "/" + attachment.getName();
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.badRequest().body("Fayl topilmadi: " + filePath);
            }

            // Excel faylni ochish
            FileInputStream fis = new FileInputStream(file);
            Workbook workbook = new XSSFWorkbook(fis);
            Sheet sheet = workbook.getSheetAt(0);

            Groups group = null;
            if (groupId != null) {
                group = groupsRepo.findById(groupId).orElse(null);
            }

            List<MagistrThemeTeacher> savedList = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell teacherCell = row.getCell(1);
                Cell themeCell = row.getCell(2);

                if (teacherCell == null || themeCell == null) continue;

                String teacherName = teacherCell.getStringCellValue().trim();
                String themeName = themeCell.getStringCellValue().trim();
                if (teacherName.isEmpty() || themeName.isEmpty()) continue;

                MagistrThemeTeacher magistrThemeTeacher = MagistrThemeTeacher.builder()
                        .teacherName(teacherName)
                        .themeName(themeName)
                        .createdAt(LocalDateTime.now())
                        .status(false)
                        .groups(group) // ✅ avtomatik shu guruh biriktiriladi
                        .build();

                magistrThemeTeacherRepo.save(magistrThemeTeacher);
                savedList.add(magistrThemeTeacher);
            }

            workbook.close();
            fis.close();

            return ResponseEntity.ok(savedList);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Xatolik: " + e.getMessage());
        }
    }

    @PostMapping("/group/{groupId}/{magistrThemeTeacherId}/")
    public HttpEntity<?> setGroup(@PathVariable UUID groupId, @PathVariable UUID magistrThemeTeacherId) {
        Optional<MagistrThemeTeacher> byId1 = magistrThemeTeacherRepo.findById(magistrThemeTeacherId);
        if (byId1.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MagistrThemeTeacher magistrThemeTeacher = byId1.get();
        Optional<Groups> byId = groupsRepo.findById(groupId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Groups group = byId.get();
        magistrThemeTeacher.setGroups(group);
        MagistrThemeTeacher save = magistrThemeTeacherRepo.save(magistrThemeTeacher);
        return ResponseEntity.ok(save);


    }

    @GetMapping
    public HttpEntity<?> getAll() {
        List<MagistrThemeTeacher> all = magistrThemeTeacherRepo.findAll();
        return ResponseEntity.ok(all);

    }

    @GetMapping("/by-group/{groupId}")
    public HttpEntity<?> getAllByGroupId(@PathVariable UUID groupId) {
        Optional<Groups> byId = groupsRepo.findById(groupId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Groups group = byId.get();
        List<MagistrThemeTeacher> all = magistrThemeTeacherRepo.findAllByGroups(group);
        return ResponseEntity.ok(all);
    }

    @DeleteMapping("/{magistrThemeTeacherId}")
    public HttpEntity<?> delete(@PathVariable UUID magistrThemeTeacherId) {
        magistrThemeTeacherRepo.deleteById(magistrThemeTeacherId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/manually")
    public HttpEntity<?> manuallyUpload(@RequestBody MagistrThemeTeacherDTO dto) {
        MagistrThemeTeacher magistrThemeTeacher = MagistrThemeTeacher.builder()
                .teacherName(dto.getTeacherName())
                .themeName(dto.getThemeName())
                .createdAt(LocalDateTime.now())
                .status(true)
                .build();
        magistrThemeTeacherRepo.save(magistrThemeTeacher);
        return ResponseEntity.ok(magistrThemeTeacher);
    }

    @PutMapping("/student/{studentId}/{magistrThemeTeacherId}")
    public HttpEntity<?> updateStudent(@PathVariable UUID studentId, @PathVariable UUID magistrThemeTeacherId, @RequestBody MagistrThemeTeacherDTO dto) {
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Student student = byId.get();
        Optional<MagistrThemeTeacher> byId1 = magistrThemeTeacherRepo.findById(magistrThemeTeacherId);
        if (byId1.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MagistrThemeTeacher magistrThemeTeacher = byId1.get();
        magistrThemeTeacher.setStudent(student);
        magistrThemeTeacher.setStatus(true);
        magistrThemeTeacher.setUpdatedAt(LocalDateTime.now());
        magistrThemeTeacher.setTeacherName(dto.getTeacherName());
        magistrThemeTeacher.setThemeName(dto.getThemeName());
        magistrThemeTeacherRepo.save(magistrThemeTeacher);
        return ResponseEntity.ok(magistrThemeTeacher);
    }

    @GetMapping("/me/{studentId}")
    public HttpEntity<?> getStudent(@PathVariable UUID studentId) {
       Optional<MagistrThemeTeacher> magistrThemeTeacher =  magistrThemeTeacherRepo.findByStudentId(studentId);
       if (magistrThemeTeacher.isPresent()) {
           return ResponseEntity.ok(magistrThemeTeacher.get());
       }
       return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public HttpEntity<?> updateMagistrThemeTeacher(
            @PathVariable UUID id,
            @RequestBody MagistrThemeTeacherDTO dto
    ) {
        Optional<MagistrThemeTeacher> optional = magistrThemeTeacherRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MagistrThemeTeacher magistrThemeTeacher = optional.get();
        magistrThemeTeacher.setTeacherName(dto.getTeacherName());
        magistrThemeTeacher.setThemeName(dto.getThemeName());
        magistrThemeTeacher.setUpdatedAt(LocalDateTime.now());
        magistrThemeTeacherRepo.save(magistrThemeTeacher);

        return ResponseEntity.ok(magistrThemeTeacher);
    }


}
