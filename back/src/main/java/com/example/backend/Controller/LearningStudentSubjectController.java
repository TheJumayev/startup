package com.example.backend.Controller;

import com.example.backend.DTO.LearningStudentSubjectDTO;
import com.example.backend.Entity.CurriculumSubject;
import com.example.backend.Entity.LearningStudentSubject;
import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.StudentSubject;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/learning-student-subject")
public class LearningStudentSubjectController {
    private final StudentSubjectRepo studentSubjectRepo;
    private final LessonRepo lessonRepo;
        private final LearningStudentSubjectRepo learningStudentSubjectRepo;
        private final CurriculumSubjectRepo curriculumSubjectRepo;
        @GetMapping("/student-subject/{studentSubjectId}")
        public HttpEntity<?> getStudentById(@PathVariable UUID studentSubjectId){
            Optional<LearningStudentSubject> all = learningStudentSubjectRepo.findByStudentSubjectId(studentSubjectId);
            if(all.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(all.get(), HttpStatus.OK);
        }


        @PostMapping
        public HttpEntity<?> addStudent(@RequestBody LearningStudentSubjectDTO learningStudentSubjectDTO){
            Optional<StudentSubject> byId = studentSubjectRepo.findById(learningStudentSubjectDTO.getStudentSubjectId());
            if(byId.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Optional<CurriculumSubject> byId1 = curriculumSubjectRepo.findById(learningStudentSubjectDTO.getCurriculumSubjectId());
            if(byId1.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            StudentSubject studentSubject = byId.get();
            CurriculumSubject curriculumSubject = byId1.get();
            LearningStudentSubject learningStudentSubject1 = new LearningStudentSubject(studentSubject,1, LocalDateTime.now(),learningStudentSubjectDTO.getRequiredLessons(),0, curriculumSubject);

            LearningStudentSubject save = learningStudentSubjectRepo.save(learningStudentSubject1);
            return new ResponseEntity<>(save, HttpStatus.CREATED);
        }

        @PostMapping("/add-read-lesson/{lessonsId}/{learningStudentSubjectId}")
        public HttpEntity<?> updateStudent(@PathVariable UUID lessonsId, @PathVariable UUID learningStudentSubjectId){
            Optional<LearningStudentSubject> byId = learningStudentSubjectRepo.findById(learningStudentSubjectId);
            if(byId.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Optional<Lesson> byId1 = lessonRepo.findById(lessonsId);
            if(byId1.isEmpty()){
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            LearningStudentSubject studentSubject = byId.get();
            Lesson lesson = byId1.get();
            studentSubject.getLessons().add(lesson);
            if (studentSubject.getLessons().size() == studentSubject.getRequiredLessons()) {
                studentSubject.setStatus(2);
            }
            LearningStudentSubject save = learningStudentSubjectRepo.save(studentSubject);
            return new ResponseEntity<>(save, HttpStatus.OK);
        }










}
