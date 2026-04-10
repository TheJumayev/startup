package com.example.backend.Controller;

import com.example.backend.Entity.FaceGroup;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.FaceGroupRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Services.HikvisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/face-group")

public class FaceGroupController {
    private final FaceGroupRepo faceGroupRepo;
    private final GroupsRepo groupsRepo;
    private final StudentRepo studentRepo;
    private final HikvisionService hikvisionService; // ✅ inject service

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<FaceGroup> all = faceGroupRepo.findAll();
        return ResponseEntity.ok(all);
    }


    @PostMapping("/{groupId}")
    public ResponseEntity<?> addFaceGroup(@PathVariable UUID groupId) {
        Optional<Groups> group = groupsRepo.findById(groupId);
        if (group.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // ✅ Create users on Hikvision for each student
        System.out.printf("GroupId: %s\n", groupId);
        List<Student> students = studentRepo.findAllByGroupId(groupId);
        for (Student student : students) {
            String name = student.getFullName();
            Integer hemisId = student.getHemisId();
            String imageUrl = student.getImage();
            boolean success = hikvisionService.createUserOnDevice(hemisId, name, imageUrl, group.get().getName());
            System.out.println("➡️ Uploaded: " + name + " → " + success);
        }


        // ✅ Save group
        FaceGroup faceGroup = new FaceGroup(group.get(), LocalDateTime.now());
        FaceGroup saved = faceGroupRepo.save(faceGroup);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{faceGroupId}/{newGroupId}")
    public ResponseEntity<?> editFaceGroup(@PathVariable UUID faceGroupId, @PathVariable UUID newGroupId) {
        // 1) FaceGroup mavjudligini tekshirish
        Optional<FaceGroup> faceGroupOpt = faceGroupRepo.findById(faceGroupId);
        if (faceGroupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 2) Yangi Groups (target) mavjudligini tekshirish
        Optional<Groups> newGroupOpt = groupsRepo.findById(newGroupId);
        if (newGroupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 3) FaceGroupni yangilash va saqlash
        FaceGroup faceGroup = faceGroupOpt.get();
        faceGroup.setGroup(newGroupOpt.get());
        faceGroup.setCreatedAt(LocalDateTime.now()); // agar updatedAt maydoni bo'lsa
        FaceGroup saved = faceGroupRepo.save(faceGroup);
        return ResponseEntity.ok(saved);
    }


    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteFaceGroup(@PathVariable UUID groupId) {
        Optional<FaceGroup> faceGroup = faceGroupRepo.findById(groupId);
        if (faceGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        faceGroupRepo.deleteById(groupId);
        return ResponseEntity.ok().build();
    }
}
