package com.example.backend.Controller;
import com.example.backend.DTO.AmaliyotYuklamasiDTO;
import com.example.backend.Entity.AmaliyotStudent;
import com.example.backend.Entity.AmaliyotYuklamasi;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.User;
import com.example.backend.Repository.AmaliyotStudentRepo;
import com.example.backend.Repository.AmaliyotYuklamasiRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/amaliyot-group")

public class AmaliyotStudentController {
    private final AmaliyotStudentRepo  amaliyotStudentRepo;
    private final GroupsRepo groupsRepo;
    private final UserRepo userRepo;
    private final AmaliyotYuklamasiRepo amaliyotYuklamasiRepo;

    @GetMapping
    public ResponseEntity<?> getAll() {
        List<AmaliyotStudent> all = amaliyotStudentRepo.findAll();
        return ResponseEntity.ok(all);
    }
    @GetMapping("/{teacherId}")
    public ResponseEntity<?> getOne(@PathVariable UUID teacherId) {
        List<AmaliyotStudent> teacher = amaliyotStudentRepo.findByTeacherId(teacherId);
        if (teacher == null || teacher.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(teacher);
    }

    @PostMapping("/multi/{teacherId}")
    public ResponseEntity<?> addMultipleGroups(
            @PathVariable UUID teacherId,
            @RequestBody List<UUID> groupIds
    ) {
        Optional<User> user = userRepo.findById(teacherId);
        if (user.isEmpty()) {
            return ResponseEntity.status(404).body("Teacher not found");
        }

        List<AmaliyotStudent> saved = new ArrayList<>();

        for (UUID groupId : groupIds) {
            Optional<Groups> group = groupsRepo.findById(groupId);
            group.ifPresent(g -> {
                AmaliyotStudent item = new AmaliyotStudent(g, user.get(), LocalDateTime.now());
                saved.add(amaliyotStudentRepo.save(item));
            });
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{amaliyotGroupId}/{newGroupId}/{teacherId}")
    public ResponseEntity<?> editFaceGroup(@PathVariable UUID amaliyotGroupId, @PathVariable UUID newGroupId, @PathVariable UUID teacherId) {
        // 1) FaceGroup mavjudligini tekshirish
        Optional<AmaliyotStudent> amaliyotGroupOpt = amaliyotStudentRepo.findById(amaliyotGroupId);
        if (amaliyotGroupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 2) Yangi Groups (target) mavjudligini tekshirish
        Optional<Groups> newGroupOpt = groupsRepo.findById(newGroupId);
        if (newGroupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<User> user = userRepo.findById(teacherId);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // 3) FaceGroupni yangilash va saqlash
        AmaliyotStudent faceGroup = amaliyotGroupOpt.get();
        faceGroup.setGroup(newGroupOpt.get());
        faceGroup.setUser(user.get());
        faceGroup.setCreatedAt(LocalDateTime.now()); // agar updatedAt maydoni bo'lsa
        AmaliyotStudent saved = amaliyotStudentRepo.save(faceGroup);
        return ResponseEntity.ok(saved);
    }
    @PutMapping("/update-endtime/group/{groupId}")
    public ResponseEntity<?> updateDeadlineForGroup(
            @PathVariable UUID groupId,
            @RequestBody AmaliyotYuklamasiDTO dto
    ) {
        List<AmaliyotYuklamasi> list = amaliyotYuklamasiRepo.findAllByGroupId(groupId);
        if (list.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        for (AmaliyotYuklamasi a : list) {
            if (dto.getKundalikEndTime() != null)
                a.setKundalikEndTime(dto.getKundalikEndTime());

            if (dto.getKundalikEndTime1() != null)
                a.setKundalikEndTime1(dto.getKundalikEndTime1());

            if (dto.getKundalikEndTime2() != null)
                a.setKundalikEndTime2(dto.getKundalikEndTime2());

            if (dto.getKundalikEndTime3() != null)
                a.setKundalikEndTime3(dto.getKundalikEndTime3());
            // 🔥 Yangi umumiy deadline
            if (dto.getDeadline() != null)
                a.setDeadline(dto.getDeadline());
        }

        amaliyotYuklamasiRepo.saveAll(list);

        return ResponseEntity.ok("Deadlines updated");
    }


    @DeleteMapping("/{connectId}")
    public ResponseEntity<?> deleteFaceGroup(@PathVariable UUID connectId) {
        Optional<AmaliyotStudent> faceGroup = amaliyotStudentRepo.findById(connectId);
        if (faceGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        amaliyotStudentRepo.deleteById(connectId);
        return ResponseEntity.ok().build();
    }
}
