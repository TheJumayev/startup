package com.example.backend.Controller;

import com.example.backend.Entity.FinalExamStudent;
import com.example.backend.Entity.ScoreSheet;
import com.example.backend.Repository.FinalExamStudentRepo;
import com.example.backend.Repository.ScoreSheetRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/student-score")
@RequiredArgsConstructor
public class StudentScoreController {
    private final StudentRepo studentRepo;
    private final ScoreSheetRepo scoreSheetRepo;
    private final FinalExamStudentRepo finalExamStudentRepo;

    @GetMapping("/score-sheet-student/{studentId}")
    public HttpEntity<?> getScoreSheetByStudentId(@PathVariable UUID studentId){
       List<ScoreSheet> list = scoreSheetRepo.findAllByStudentId(studentId);
       return ResponseEntity.ok(list);
    }
//



}
