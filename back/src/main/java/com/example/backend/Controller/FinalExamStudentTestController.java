package com.example.backend.Controller;

import com.example.backend.Entity.FinalExamStudent;
import com.example.backend.Entity.FinalExamStudentTest;
import com.example.backend.Repository.*;
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
@RequestMapping("/api/v1/final-exam-student-test")
public class FinalExamStudentTestController {
    private final FinalExamRepo finalExamRepo;
    private final StudentRepo studentRepo;
    private final ContractRepo contractRepo;
    private final DiscountStudentRepo discountStudentRepo;
    private final ScoreSheetRepo scoreSheetRepo;
    private final ScoreSheetGroupRepo scoreSheetGroupRepo;
    private final FinalExamStudentRepo finalExamStudentRepo;
    private final ContractAmountRepo contractAmountRepo;
    private final AttachmentRepo attachmentRepo;
    private final TestCurriculumSubjectRepo testCurriculumSubjectRepo;
    private final FinalExamStudentTestRepo finalExamStudentTestRepo;
    private final UniverPcRepo univerPcRepo;


    @GetMapping("/{finalExamStudentTestId}/{answer}")
    public HttpEntity<?> getFinalExamStudentTest(@PathVariable UUID finalExamStudentTestId, @PathVariable Integer answer) {
        Optional<FinalExamStudentTest> testAnswer = finalExamStudentTestRepo.findById(finalExamStudentTestId);
        if (testAnswer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FinalExamStudentTest finalExamStudentTest = testAnswer.get();
        finalExamStudentTest.setSelectedAnswer(answer);
        finalExamStudentTest.setIsCorrect(answer == finalExamStudentTest.getCorrectAnswer());
        finalExamStudentTest.setSelectedTime(LocalDateTime.now());
        FinalExamStudentTest save = finalExamStudentTestRepo.save(finalExamStudentTest);
        return ResponseEntity.ok(save);
    }

    @GetMapping("/view/tests/{finalExamStudentId}")
    public HttpEntity<?> getTests(@PathVariable UUID finalExamStudentId) {
        List<FinalExamStudentTest> FinalExamStudentId = finalExamStudentTestRepo.findByFinalExamStudentId(finalExamStudentId);
        if (FinalExamStudentId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(FinalExamStudentId);
    }

    @GetMapping("/finish-exam/{finalExamStudentId}")
    public HttpEntity<?> finishExam(@PathVariable UUID finalExamStudentId) {
        Optional<FinalExamStudent> byId = finalExamStudentRepo.findById(finalExamStudentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FinalExamStudent finalExamStudent = byId.get();
        finalExamStudent.setEndTime(LocalDateTime.now());
        List<FinalExamStudentTest> tests = finalExamStudentTestRepo.findByFinalExamStudentId(finalExamStudentId);
        int ballForOneCorrect = finalExamStudent.getFinalExam().getMaxBall()/tests.size();
        int correct = 0;
        int wrong = 0;
        for (FinalExamStudentTest test : tests) {
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
        finalExamStudent.setIsPassed(correct>=tests.size()*60/100);
        FinalExamStudent save = finalExamStudentRepo.save(finalExamStudent);
        return ResponseEntity.ok(save);
    }
}
