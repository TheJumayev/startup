package com.example.backend.Controller;

import com.example.backend.Entity.FinalExamStudent;
import com.example.backend.Entity.MustaqilExamStudentTest;
import com.example.backend.Entity.MustaqilTalimStudent;
import com.example.backend.Repository.MustaqilExamStudentTestRepo;
import com.example.backend.Repository.MustaqilTalimStudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/mustaqil-exam-student-test")
public class MustaqilExamStudentTestController {
    private final MustaqilExamStudentTestRepo mustaqilExamStudentTestRepo;
    private final MustaqilTalimStudentRepo mustaqilTalimStudentRepo;

    @GetMapping("/{finalExamStudentTestId}/{answer}")
    public HttpEntity<?> getFinalExamStudentTest(@PathVariable UUID finalExamStudentTestId, @PathVariable Integer answer) {
        Optional<MustaqilExamStudentTest> testAnswer = mustaqilExamStudentTestRepo.findById(finalExamStudentTestId);
        if (testAnswer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MustaqilExamStudentTest finalExamStudentTest = testAnswer.get();
        finalExamStudentTest.setSelectedAnswer(answer);
        finalExamStudentTest.setIsCorrect(answer == finalExamStudentTest.getCorrectAnswer());
        finalExamStudentTest.setSelectedTime(LocalDateTime.now());
        MustaqilExamStudentTest save = mustaqilExamStudentTestRepo.save(finalExamStudentTest);
        return ResponseEntity.ok(save);
    }

    @GetMapping("/view/tests/{finalExamStudentId}")
    public HttpEntity<?> getTests(@PathVariable UUID finalExamStudentId) {
        List<MustaqilExamStudentTest> FinalExamStudentId = mustaqilExamStudentTestRepo.findByMustaqilExamStudentId(finalExamStudentId);
        if (FinalExamStudentId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(FinalExamStudentId);
    }

    @GetMapping("/finish-exam/{finalExamStudentId}")
    public HttpEntity<?> finishExam(@PathVariable UUID finalExamStudentId) {
        Optional<MustaqilTalimStudent> byId = mustaqilTalimStudentRepo.findById(finalExamStudentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MustaqilTalimStudent finalExamStudent = byId.get();
        finalExamStudent.setEndTime(LocalDateTime.now());
        List<MustaqilExamStudentTest> tests = mustaqilExamStudentTestRepo.findByMustaqilExamStudentId(finalExamStudentId);
        int ballForOneCorrect = finalExamStudent.getMustaqilExam().getMaxBall()/tests.size();
        int correct = 0;
        int wrong = 0;
        for (MustaqilExamStudentTest test : tests) {
            if (test.getIsCorrect()==null){
                wrong++;
                continue;
            }
            if (test.getIsCorrect()){
                correct++;
            }else {
                wrong++;
            }
        }
        finalExamStudent.setBall(ballForOneCorrect*correct);
        finalExamStudent.setCorrectCount(correct);
        finalExamStudent.setWrongCount(wrong);
        finalExamStudent.setIsPassed(correct >= 5);
        MustaqilTalimStudent save = mustaqilTalimStudentRepo.save(finalExamStudent);
        return ResponseEntity.ok(save);
    }
}
