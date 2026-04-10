package com.example.backend.Controller;

import com.example.backend.Entity.StudentSubject;
import com.example.backend.Repository.StudentSubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/balance")
public class BalanceController {

    private final StudentSubjectRepo studentSubjectRepo;
//    @GetMapping
//    public String getBalance() {
//        List<StudentSubject> subjects = studentSubjectRepo.findAllByPayed();
//    }
}
