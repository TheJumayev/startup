package com.example.backend.Controller;

import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.OnlineStudent;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.OnlineStudentRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Controller for managing OnlineStudent records.
 * OnlineStudent – bu talabaning “online” statusini bildiruvchi jadval.
 * Unda talabaning qachon online bo‘lganligi va kerak bo‘lsa asosiy fayli ham saqlanadi.
 */
@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/online-student")
public class OnlineStudentController {

    private final StudentRepo studentRepo;
    private final OnlineStudentRepo onlineStudentRepo;
    private final AttachmentRepo attachmentRepo;

    /**
     * Barcha studentlarni qaytaradi.
     */
    @GetMapping
    public HttpEntity<?> findAll() {
        return new ResponseEntity<>(onlineStudentRepo.findAll(), HttpStatus.OK);
    }

    /**
     * Berilgan groupId bo‘yicha barcha OnlineStudent yozuvlarini qaytaradi.
     */
    @GetMapping("/group/{groupId}")
    public HttpEntity<?> findAllByGroupId(@PathVariable UUID groupId) {
        List<OnlineStudent> onlineStudents = onlineStudentRepo.findByGroupId(groupId);
        return new ResponseEntity<>(onlineStudents, HttpStatus.OK);
    }

    /**
     * Talaba ID orqali OnlineStudent yozuvini qaytaradi.
     * Agar mavjud bo‘lmasa 404 qaytaradi.
     */
    @GetMapping("/student/{studentId}")
    public HttpEntity<?> findAllByStudentId(@PathVariable UUID studentId) {
        Optional<OnlineStudent> onlineStudent = onlineStudentRepo.findByStudentId(studentId);
        return onlineStudent.map(student ->
                new ResponseEntity<>(student, HttpStatus.OK)
        ).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Studentni “online” sifatida qo‘shadi.
     * - Student mavjud bo‘lsa uning isOnline = true qilinadi.
     * - OnlineStudent jadvaliga yangi yozuv qo‘shiladi.
     */
    @PostMapping("/{studentId}")
    public HttpEntity<?> addStudent(@PathVariable UUID studentId) {
        System.out.printf("addStudent: studentId=%s\n", studentId);
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Student student = byId.get();
        student.setIsOnline(true); // student flag
        studentRepo.save(student);

        Optional<OnlineStudent> byStudentId = onlineStudentRepo.findByStudentId(studentId);
        if (byStudentId.isEmpty()) {


            OnlineStudent onlineStudent = new OnlineStudent(LocalDateTime.now(), student, true);
            OnlineStudent saved = onlineStudentRepo.save(onlineStudent);

            return new ResponseEntity<>(saved, HttpStatus.OK);
        }
        OnlineStudent onlineStudent = byStudentId.get();
        onlineStudent.setStatus(true);
        onlineStudent.setUpdated(LocalDateTime.now());
        OnlineStudent save = onlineStudentRepo.save(onlineStudent);
        return new ResponseEntity<>(save, HttpStatus.OK);


    }



    /**
     * Studentni online sifatida qo‘shadi va unga fayl (asos) biriktiriladi.
     */
    @PostMapping("/online/{studentId}/{fileId}")
    public HttpEntity<?> addStudentWithFile(@PathVariable UUID studentId, @PathVariable UUID fileId) {
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Student student = byId.get();
        student.setIsOnline(true);
        studentRepo.save(student);

        Attachment attachment = attachmentRepo.findById(fileId).orElse(null);

        OnlineStudent onlineStudent = new OnlineStudent(LocalDateTime.now(), student, true, attachment);
        OnlineStudent saved = onlineStudentRepo.save(onlineStudent);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    /**
     * Mavjud OnlineStudent yozuviga fayl biriktirish (update qilish).
     */
    @PutMapping("/add-file/{onlineStudentId}/{fileId}")
    public HttpEntity<?> putStudentWithFile(@PathVariable UUID onlineStudentId,
                                            @PathVariable UUID fileId) {
        Optional<OnlineStudent> onlineStudentOpt = onlineStudentRepo.findById(onlineStudentId);
        if (onlineStudentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<Attachment> attachmentOpt = attachmentRepo.findById(fileId);
        if (attachmentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        OnlineStudent onlineStudent = onlineStudentOpt.get();
        onlineStudent.setFile(attachmentOpt.get());

        OnlineStudent saved = onlineStudentRepo.save(onlineStudent);

        return new ResponseEntity<>(saved, HttpStatus.OK);
    }




    @PutMapping("/remove/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable UUID studentId) {
        return studentRepo.findById(studentId)
                .map(student -> {
                    student.setIsOnline(false);
                    studentRepo.save(student);

                    return onlineStudentRepo.findById(studentId)
                            .map(os -> {
                                os.setStatus(false);
                                onlineStudentRepo.save(os);
                                return new ResponseEntity<>(os, HttpStatus.OK);
                            })
                            .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
                })
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
