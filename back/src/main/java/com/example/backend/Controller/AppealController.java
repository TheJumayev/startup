package com.example.backend.Controller;

import com.example.backend.DTO.AppealDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.AppealRepo;
import com.example.backend.Repository.AppealTypeRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/appeal")
public class AppealController {

    private final AppealTypeRepo appealTypeRepo;
    private final AppealRepo appealRepo;
    private final StudentRepo studentRepo;
    private final UserRepo userRepo;

    @GetMapping("/by-group/{groupId}")
    public HttpEntity<?> getByGroupId(@PathVariable UUID groupId){
        List<Appeal> all  = appealRepo.findAllByGroupId(groupId);
        return new ResponseEntity<>(all, HttpStatus.OK);

    }



    @PutMapping("/dekan/{appealId}/{dekanId}/{status}")
    public HttpEntity<?> setDekan(@PathVariable UUID appealId, @PathVariable UUID dekanId, @PathVariable Integer status) {
//        status =1 bolsa tasdiqlandi
//        status=2 bolsa rad qilindi
        Optional<Appeal> byId = appealRepo.findById(appealId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Appeal appeal = byId.get();
        Optional<User> byId1 = userRepo.findById(dekanId);
        if (byId1.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = byId1.get();
        appeal.setDekan(user);
        appeal.setDekanStatus(status == 1);

        UUID specialTypeId = UUID.fromString("b39e7117-462a-4880-b445-4b7b5b0c9bcd");
        if (appeal.getAppealType() != null && specialTypeId.equals(appeal.getAppealType().getId())) {
            appeal.setStatus(1);
        }

        return  new ResponseEntity<>(appealRepo.save(appeal), HttpStatus.OK);
    }
    // 🔹 Get all appeals
    @GetMapping
    public ResponseEntity<List<Appeal>> getAllAppeal() {
        return ResponseEntity.ok(appealRepo.findAll());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Appeal>> getAppealById(@PathVariable UUID id) {
        return ResponseEntity.ok(appealRepo.findByAppealId(id));
    }
    // 🔹 Get appeals by appealTypeId
    @GetMapping("/appeal-type/{appealTypeId}")
    public ResponseEntity<List<Appeal>> getAppealType(@PathVariable UUID appealTypeId) {
        return ResponseEntity.ok(appealRepo.findByAppealTypeId(appealTypeId));
    }
    // 🔹 Get appeals by student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getAppealsByStudent(@PathVariable UUID studentId) {
        List<Appeal> byStudentId = appealRepo.findByStudentId(studentId);
        return ResponseEntity.ok(byStudentId);
    }
    @GetMapping("/student-appeal-status/{studentId}/{appealTypeId}")
    public HttpEntity<?> findAppealByStatus(@PathVariable UUID studentId, @PathVariable UUID appealTypeId) {

       Optional<Appeal> appealOpt = appealRepo.findByStudentIdAndAppealTypeIdAndStatus(studentId, appealTypeId, 0);
       if (appealOpt.isPresent()) {
           Appeal appeal = appealOpt.get();
           System.out.println(appeal);
           return ResponseEntity.ok(appeal);
       }
       return ResponseEntity.notFound().build();
    }
    // 🔹 Create new appeal
    @PostMapping
    public ResponseEntity<?> addAppeal(@RequestBody AppealDTO appealDTO) {
        Optional<Student> studentOpt = studentRepo.findById(appealDTO.getStudentId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Student not found");
        }
        Optional<AppealType> typeOpt = appealTypeRepo.findById(appealDTO.getAppealId());
        if (typeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ AppealType not found");
        }
        Appeal appeal = Appeal.builder()
                .appealType(typeOpt.get())
                .student(studentOpt.get())
                .text1(appealDTO.getText1())
                .text2(appealDTO.getText2())
                .createdAt(LocalDateTime.now())
                .status(0) // 0 - yangi (new)
                .build();
        // If file is attached
        if (appealDTO.getFileId() != null) {
            Attachment file = new Attachment();
            file.setId(appealDTO.getFileId());
            appeal.setFile(file);
        }

        appealRepo.save(appeal);
        return ResponseEntity.ok(appeal);
    }

    // 🔹 Update appeal response (admin tarafidan)
    @PutMapping("/respond/{appealId}")
    public ResponseEntity<?> respondToAppeal(
            @PathVariable UUID appealId,
            @RequestParam String responseText,
            @RequestParam Integer status,
            @RequestParam(required = false) UUID responseFileId
    ) {
        Optional<Appeal> appealOpt = appealRepo.findById(appealId);
        if (appealOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Appeal not found");
        }

        Appeal appeal = appealOpt.get();
        appeal.setResponseText(responseText);
        appeal.setResponseTime(LocalDateTime.now());
        appeal.setStatus(status); // 1 - answered

        if (responseFileId != null) {
            Attachment file = new Attachment();
            file.setId(responseFileId);
            appeal.setResponsfile(file);
        }

        appealRepo.save(appeal);
        return ResponseEntity.ok(appeal);
    }
    // 🔹 Delete appeal
    @DeleteMapping("/{appealId}")
    public ResponseEntity<?> deleteAppeal(@PathVariable UUID appealId) {
        if (!appealRepo.existsById(appealId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Appeal not found");
        }
        appealRepo.deleteById(appealId);
        return ResponseEntity.ok("✅ Appeal deleted successfully");
    }
}
