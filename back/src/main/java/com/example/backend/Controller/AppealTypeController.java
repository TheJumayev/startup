package com.example.backend.Controller;

import com.example.backend.Entity.AppealType;
import com.example.backend.Repository.AppealTypeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/appeal-type")
public class AppealTypeController {
    private final AppealTypeRepo appealTypeRepo;

    @GetMapping
    public HttpEntity<?> findAll() {
        List<AppealType> all = appealTypeRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @GetMapping("/active")
    public HttpEntity<?> findAllActive() {
        List<AppealType> all = appealTypeRepo.findAllByStatus(true);
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @PostMapping
    public HttpEntity<?> save(@RequestBody AppealType appealType) {
        System.out.println("save appealType " + appealType);
        AppealType save = appealTypeRepo.save(appealType);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    @PutMapping
    public HttpEntity<?> update(@RequestBody AppealType appealType) {
        AppealType update = appealTypeRepo.save(appealType);
        return new ResponseEntity<>(update, HttpStatus.OK);
    }

}
