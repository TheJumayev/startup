package com.example.backend.Controller;
import com.example.backend.DTO.TeacherCurriculumsDTO;
import com.example.backend.Entity.CurriculumSubject;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.MustaqilTalimTeacher;
import com.example.backend.Entity.User;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/mustaqil-teacher")
public class MustaqilTalimTeacherController {
    private final MustaqilTalimTeacherRepo mustaqilTalimTeacherRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final UserRepo userRepo;
    private final GroupsRepo groupsRepo;
    // ✅ Get all teacher-curriculum-subject records
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(mustaqilTalimTeacherRepo.findAll());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getTeacherCurriculumSubject(@PathVariable UUID groupId) {
        List<MustaqilTalimTeacher> subjects = mustaqilTalimTeacherRepo.findByGroups_Id(groupId);
        if (subjects.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subjects);
    }
    // ✅ Get all curriculum subjects by teacherId
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getByTeacher(@PathVariable UUID teacherId) {
        if (userRepo.findById(teacherId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Teacher not found", "teacherId", teacherId));
        }
        return ResponseEntity.ok(mustaqilTalimTeacherRepo.findAllByTeacher_Id(teacherId));
    }
    @PutMapping("/{oldTeacherId}/{newTeacherId}")
    public HttpEntity<?> editTeacher(
            @PathVariable UUID oldTeacherId,
            @PathVariable UUID newTeacherId) {

        List<MustaqilTalimTeacher> list = mustaqilTalimTeacherRepo.findByTeacherId(oldTeacherId);

        if (list.isEmpty()) {
            return ResponseEntity.status(404).body("Eski o‘qituvchi topilmadi");
        }
        User newTeacher = userRepo.findById(newTeacherId)
                .orElseThrow(() -> new RuntimeException("Yangi o‘qituvchi topilmadi"));

        for (MustaqilTalimTeacher item : list) {
            item.setTeacher(newTeacher);
        }

        mustaqilTalimTeacherRepo.saveAll(list);

        return ResponseEntity.ok("O‘qituvchi muvaffaqiyatli almashtirildi");
    }

    // ✅ POST: assign multiple curriculumSubjects to a teacher (append, don't remove old ones)
    @PostMapping
    public ResponseEntity<?> addForTeacher(@RequestBody TeacherCurriculumsDTO dto) {
        Optional<User> teacherOpt = userRepo.findById(dto.getTeacherId());
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Teacher not found", "teacherId", dto.getTeacherId()));
        }
        User teacher = teacherOpt.get();
        List<CurriculumSubject>  curriculumSubjects = new ArrayList<>();
        for (UUID curriculumId : dto.getCurriculumSubjectIds()) {
            Optional<CurriculumSubject> byId = curriculumSubjectRepo.findById(curriculumId);
            if (byId.isEmpty()) {
                continue;
            }
            CurriculumSubject curriculumSubject = byId.get();
            curriculumSubjects.add(curriculumSubject);
        }
        Optional<Groups> byId = groupsRepo.findById(dto.getGroupIds());
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MustaqilTalimTeacher MustaqilTalimTeacher = new MustaqilTalimTeacher(teacher, curriculumSubjects,byId.get(),LocalDateTime.now());
        MustaqilTalimTeacher save = mustaqilTalimTeacherRepo.save(MustaqilTalimTeacher);
        return ResponseEntity.ok(save);
    }

    // ❌ ID boyicha ochirish (frontend deleteAssignedRow(row.id) uchun kerak)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable UUID id) {
        Optional<MustaqilTalimTeacher> optional = mustaqilTalimTeacherRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(404).body("Ma'lumot topilmadi");
        }
        mustaqilTalimTeacherRepo.delete(optional.get());
        return ResponseEntity.ok("Biriktirish o‘chirildi");
    }



    @PutMapping
    public ResponseEntity<?> replaceForTeacher(@RequestBody TeacherCurriculumsDTO dto) {
        // 1. O‘qituvchini topamiz
        Optional<User> userOpt = userRepo.findById(dto.getTeacherId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
        }

        // 2. Guruhni topamiz
        Optional<Groups> groupOpt = groupsRepo.findById(dto.getGroupIds());
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
        }

        User teacher = userOpt.get();
        Groups group = groupOpt.get();

        // 3. Mavjud teacher_curriculum yozuvni topamiz (teacher_id + group_id bo‘yicha)
        Optional<MustaqilTalimTeacher> existingOpt =
                mustaqilTalimTeacherRepo.findByTeacherAndGroups(teacher, group);
        MustaqilTalimTeacher teacherCurriculum;
        if (existingOpt.isPresent()) {
            // ✅ Agar mavjud bo‘lsa, o‘shani ishlatamiz
            teacherCurriculum = existingOpt.get();
        } else {
            // ✅ Aks holda yangisini yaratamiz
            teacherCurriculum = new MustaqilTalimTeacher();
            teacherCurriculum.setTeacher(teacher);
            teacherCurriculum.setGroups(group);
            teacherCurriculum = mustaqilTalimTeacherRepo.save(teacherCurriculum);
        }
        // 4. Eski bog‘lanmalarni (teacher_curriculms_curriculum_subject jadvalidan) tozalaymiz
        teacherCurriculum.getCurriculumSubject().clear();
        mustaqilTalimTeacherRepo.save(teacherCurriculum);

        // 5. Yangi fanlarni topamiz va bog‘laymiz
        List<CurriculumSubject> newSubjects = curriculumSubjectRepo
                .findAllById(dto.getCurriculumSubjectIds());

        teacherCurriculum.setCurriculumSubject(newSubjects);

        mustaqilTalimTeacherRepo.save(teacherCurriculum);

        return ResponseEntity.ok("Fanlar yangilandi!");
    }

}
