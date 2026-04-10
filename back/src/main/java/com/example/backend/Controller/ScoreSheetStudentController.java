package com.example.backend.Controller;

import com.example.backend.Entity.ScoreSheet;
import com.example.backend.Repository.ScoreSheetRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/score-sheet-student")
@RequiredArgsConstructor
public class ScoreSheetStudentController {

    private final ScoreSheetRepo scoreSheetRepo;
    private final StudentRepo studentRepo;

    @GetMapping("/{studentId}")
    public HttpEntity<?> getScoreSheet(@PathVariable UUID studentId){
        List<ScoreSheet> scoreSheets = scoreSheetRepo.findByStudentId(studentId);
        return new ResponseEntity<>(scoreSheets, HttpStatus.OK);
    }

    @DeleteMapping("/{studentId}")
    public HttpEntity<?> deleteScoreSheet(@PathVariable UUID studentId){
        scoreSheetRepo.deleteByStudentId(studentId);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping("/accept/{scoreSheetId}")
    public HttpEntity<?> acceptScoreSheet(@PathVariable UUID scoreSheetId){
        Optional<ScoreSheet> byId = scoreSheetRepo.findById(scoreSheetId);
        if(byId.isPresent()){
            ScoreSheet scoreSheet = byId.get();
            scoreSheet.setAcceptedAt(LocalDateTime.now());
            scoreSheet.setIsAccepted(true);
            scoreSheetRepo.save(scoreSheet);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }







}
