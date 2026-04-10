package com.example.backend.Controller;

import com.example.backend.DTO.TeacherCurriculumsDTO;
import com.example.backend.Entity.CurriculumSubject;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.TeacherCurriculumSubject;
import com.example.backend.Entity.User;
import com.example.backend.Repository.CurriculumSubjectRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.TeacherCurriculumSubjectRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/teacher-curriculum-subject")
@RequiredArgsConstructor
public class TeacherCurriculumSubjectController {

    private final TeacherCurriculumSubjectRepo teacherCurriculumRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final UserRepo userRepo;
    private final GroupsRepo   groupsRepo;

    // ✅ Get all teacher-curriculum-subject records
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(teacherCurriculumRepo.findAll());
    }

    // ✅ Get all curriculum subjects by teacherId
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getByTeacher(@PathVariable UUID teacherId) {
        if (userRepo.findById(teacherId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Teacher not found", "teacherId", teacherId));
        }
        return ResponseEntity.ok(teacherCurriculumRepo.findAllByTeacher_Id(teacherId));
    }
    @PutMapping("/{oldTeacherId}/{newTeacherId}")
    public HttpEntity<?> editTeacher(
            @PathVariable UUID oldTeacherId,
            @PathVariable UUID newTeacherId) {

        List<TeacherCurriculumSubject> list = teacherCurriculumRepo.findByTeacherId(oldTeacherId);

        if (list.isEmpty()) {
            return ResponseEntity.status(404).body("Eski o‘qituvchi topilmadi");
        }
        User newTeacher = userRepo.findById(newTeacherId)
                .orElseThrow(() -> new RuntimeException("Yangi o‘qituvchi topilmadi"));

        for (TeacherCurriculumSubject item : list) {
            item.setTeacher(newTeacher);
        }

        teacherCurriculumRepo.saveAll(list);

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
        TeacherCurriculumSubject teacherCurriculumSubject = new TeacherCurriculumSubject(teacher, curriculumSubjects,byId.get(),LocalDateTime.now());
        TeacherCurriculumSubject save = teacherCurriculumRepo.save(teacherCurriculumSubject);
        return ResponseEntity.ok(save);
    }

    // ❌ ID boyicha ochirish (frontend deleteAssignedRow(row.id) uchun kerak)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable UUID id) {
        Optional<TeacherCurriculumSubject> optional = teacherCurriculumRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(404).body("Ma'lumot topilmadi");
        }
        teacherCurriculumRepo.delete(optional.get());
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
        Optional<TeacherCurriculumSubject> existingOpt =
                teacherCurriculumRepo.findByTeacherAndGroups(teacher, group);

        TeacherCurriculumSubject teacherCurriculum;

        if (existingOpt.isPresent()) {
            // ✅ Agar mavjud bo‘lsa, o‘shani ishlatamiz
            teacherCurriculum = existingOpt.get();
        } else {
            // ✅ Aks holda yangisini yaratamiz
            teacherCurriculum = new TeacherCurriculumSubject();
            teacherCurriculum.setTeacher(teacher);
            teacherCurriculum.setGroups(group);
            teacherCurriculum = teacherCurriculumRepo.save(teacherCurriculum);
        }

        // 4. Eski bog‘lanmalarni (teacher_curriculms_curriculum_subject jadvalidan) tozalaymiz
        teacherCurriculum.getCurriculumSubject().clear();
        teacherCurriculumRepo.save(teacherCurriculum);

        // 5. Yangi fanlarni topamiz va bog‘laymiz
        List<CurriculumSubject> newSubjects = curriculumSubjectRepo
                .findAllById(dto.getCurriculumSubjectIds());

        teacherCurriculum.setCurriculumSubject(newSubjects);

        teacherCurriculumRepo.save(teacherCurriculum);

        return ResponseEntity.ok("Fanlar yangilandi!");
    }
}
