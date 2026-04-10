package com.example.backend.Controller;

import com.example.backend.DTO.StudentDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/my-student")
public class MyStudentController {
    private final StudentRepo studentRepo;
    private final GroupsRepo groupsRepo;
    private final AttachmentRepo attachmentRepo;

    // ========================= CREATE STUDENT ============================
    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody StudentDTO dto) {

        // 🔍 1. hemisId unique tekshiruvi
        if (dto.getHemisId() != null) {
            Optional<Student> existsHemisId = studentRepo.findByHemisId(dto.getHemisId());
            if (existsHemisId.isPresent()) {  // <-- to‘g‘ri tekshiruv
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Ushbu hemisId bilan talaba mavjud!");
            }
        }

// 🔍 2. studentIdNumber unique tekshiruvi
        if (dto.getStudentIdNumber() != null) {
            Optional<Student> existsPassport = studentRepo.findByStudentIdNumber(dto.getStudentIdNumber());
            if (existsPassport.isPresent()) { // <-- to‘g‘ri tekshiruv
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Ushbu passport/studentIdNumber bilan talaba mavjud!");
            }
        }

        Student student = new Student();
        student.setIsMy(true);
        student.setHemisId(dto.getHemisId());
        student.setFirstName(dto.getFirstName());
        student.setSecondName(dto.getSecondName());
        student.setThirdName(dto.getThirdName());
        student.setFullName(dto.getFirstName() + " " + dto.getSecondName()+" "+dto.getThirdName());
        student.setShortName(dto.getShortName());
        student.setStudentIdNumber(dto.getStudentIdNumber());
//        student.setImage(dto.getImage());
//        student.setIsOnline(dto.getIsOnline());
        student.setLevel(dto.getLevel());
        student.setLevelName(dto.getLevelName());
        student.setPaymentForm(dto.getPaymentForm());
        student.setSemester(dto.getSemester());
        student.setSemesterName(dto.getSemesterName());
        student.setSpecialtyName(dto.getSpecialtyName());
        student.setDepartmentName(dto.getDepartmentName());
        student.setEducationForm(dto.getEducationForm());
        student.setEducationType(dto.getEducationType());
        student.setEducationYear(dto.getEducationYear());
        student.setStudentStatus(dto.getStudentStatus());
        student.setYearOfEnter(dto.getYearOfEnter() != null ? Integer.valueOf(dto.getYearOfEnter()) : null);
        student.setPassword(dto.getPassword());
        student.setGroupName(dto.getGroupName());
        if (dto.getImageId() != null) {
            attachmentRepo.findById(dto.getImageId()).ifPresent(att -> {
                String url = "https://edu.bxu.uz/api/v1/file/getFile/" + att.getId();
                student.setImage(url);
            });
        }


        // Set group if exists
        if (dto.getGroupId() != null) {
            Groups group = groupsRepo.findById(dto.getGroupId()).orElse(null);
            student.setGroup(group);
        }

        Student saved = studentRepo.save(student);
        return ResponseEntity.ok(saved);
    }

    // ========================= GET ALL STUDENTS ============================
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepo.findAll());
    }

    // ========================= GET ONE STUDENT ============================
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable UUID id) {
        return ResponseEntity.of(studentRepo.findById(id));
    }

    // ========================= UPDATE STUDENT ============================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable UUID id, @RequestBody StudentDTO dto) {

        if (dto.getHemisId() != null) {
            Optional<Student> exists = studentRepo.findByHemisId(dto.getHemisId());
            if (exists.isPresent() && !exists.get().getId().equals(id)) {
                return ResponseEntity.badRequest()
                        .body("Ushbu hemisId bilan boshqa talaba mavjud!");
            }
        }

        if (dto.getStudentIdNumber() != null) {
            Optional<Student> exists = studentRepo.findByStudentIdNumber(dto.getStudentIdNumber());
            if (exists.isPresent() && !exists.get().getId().equals(id)) {
                return ResponseEntity.badRequest()
                        .body("Ushbu studentIdNumber bilan boshqa talaba mavjud!");
            }
        }

        Student student = studentRepo.findById(id).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();
        student.setFirstName(dto.getFirstName());
        student.setSecondName(dto.getSecondName());
        student.setThirdName(dto.getThirdName());
        student.setShortName(dto.getShortName());
        student.setStudentIdNumber(dto.getStudentIdNumber());
//        student.setImage(dto.getImage());
//        student.setIsOnline(dto.getIsOnline());
        student.setLevel(dto.getLevel());
        student.setLevelName(dto.getLevelName());
        student.setPaymentForm(dto.getPaymentForm());
        student.setSemester(dto.getSemester());
        student.setSemesterName(dto.getSemesterName());
        student.setSpecialtyName(dto.getSpecialtyName());
        student.setDepartmentName(dto.getDepartmentName());
        student.setEducationForm(dto.getEducationForm());
        student.setEducationType(dto.getEducationType());
        student.setEducationYear(dto.getEducationYear());
        student.setStudentStatus(dto.getStudentStatus());
        student.setFullName(dto.getFirstName() + " " + dto.getSecondName()+" "+dto.getThirdName());

        student.setPassword(dto.getPassword());
        student.setGroupName(dto.getGroupName());
        if (dto.getImageId() != null) {
            attachmentRepo.findById(dto.getImageId()).ifPresent(att -> {
                String url = "https://edu.bxu.uz/api/v1/file/getFile/" + att.getId();
                student.setImage(url);
            });
        }


        // Update group
        if (dto.getGroupId() != null) {
            Groups group = groupsRepo.findById(dto.getGroupId()).orElse(null);
            student.setGroup(group);
        }

        Student saved = studentRepo.save(student);
        return ResponseEntity.ok(saved);
    }

    // ========================= DELETE STUDENT ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (!studentRepo.existsById(id)) return ResponseEntity.notFound().build();

        studentRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
