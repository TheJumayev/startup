package com.example.backend.Controller;


import com.example.backend.DTO.TestTeacherDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/v1/test-teacher")
@RequiredArgsConstructor
public class TestTeacherController {
    private final TestTeacherRepo testTeacherRepo;
    private final UserRepo userRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;

    @GetMapping
    public ResponseEntity<?> getTestTeachers() {
        List<TestTeacher> all = testTeacherRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);

    }

    @PostMapping
    public ResponseEntity<?> createTestTeacher(@RequestBody TestTeacherDTO testTeacherDTO) {
        Optional<User> byId = userRepo.findById(testTeacherDTO.getTeacherId());
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Optional<CurriculumSubject> byCurriculumId = curriculumSubjectRepo.findById(testTeacherDTO.getCurriculumSubjectId());
        if (byCurriculumId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        TestTeacher testTeacher = new TestTeacher(byId.get(), byCurriculumId.get(), testTeacherDTO.getBall(), testTeacherDTO.getPercentBall(), LocalDateTime.now());
        TestTeacher save = testTeacherRepo.save(testTeacher);
        return new ResponseEntity<>(save, HttpStatus.CREATED);
    }

}
