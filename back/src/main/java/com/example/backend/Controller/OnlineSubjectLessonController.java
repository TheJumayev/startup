package com.example.backend.Controller;

import com.example.backend.Entity.Curriculum;
import com.example.backend.Entity.CurriculumSubject;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/online-subject-lesson")
public class OnlineSubjectLessonController {

    private final CurriculumRepo curriculumRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final GroupsRepo groupsRepo;
    private final StudentRepo studentRepo;

    @GetMapping("/group/{groupId}")
    public HttpEntity<?> getCurriculumSubject(@PathVariable UUID groupId){
        Optional<Groups> byId = groupsRepo.findById(groupId);
        if (byId.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Groups groups = byId.get();
        if (groups.getCurriculum() == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<CurriculumSubject> curriculumSubject = curriculumSubjectRepo.findByGroupCurriculum(groups.getCurriculum());
        return new ResponseEntity<>(curriculumSubject, HttpStatus.OK);

    }


    @GetMapping("/student/{studentId}")
    public HttpEntity<?> getStudentSubject(@PathVariable UUID studentId){
        Optional<Student> byId = studentRepo.findById(studentId);
        if (byId.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Student student = byId.get();
        if (student.getGroup().getCurriculum() == null){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<CurriculumSubject> curriculumSubject = curriculumSubjectRepo.findByGroupCurriculum(student.getGroup().getCurriculum());
        return new ResponseEntity<>(curriculumSubject, HttpStatus.OK);
    }



}
