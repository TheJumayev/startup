package com.example.backend.Controller;

import com.example.backend.Entity.TestCenterCode;
import com.example.backend.Repository.TestCenterCodeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/test-center-code")
public class TestCenterCodeController {

    private final TestCenterCodeRepo testCenterCodeRepo;

    @GetMapping
    public HttpEntity<?> getAllTestCenterCode() {
        List<TestCenterCode> all = testCenterCodeRepo.findAll();
        return ResponseEntity.ok(all);
    }

    @PostMapping("/{code}")
    public HttpEntity<?> saveTestCenterCode(@PathVariable Integer code){
        TestCenterCode testCenterCode = new TestCenterCode(code, LocalDateTime.now());
        testCenterCodeRepo.save(testCenterCode);
        return ResponseEntity.ok(testCenterCode);
    }

    @PutMapping("/{id}/{code}")
    public HttpEntity<?> updateTestCenterCode(@PathVariable UUID id, @PathVariable Integer code){
        TestCenterCode testCenterCode = testCenterCodeRepo.findById(id).orElse(null);
        if (testCenterCode == null) {
            return ResponseEntity.notFound().build();
        }
        testCenterCode.setCode(code);
        testCenterCodeRepo.save(testCenterCode);
        return ResponseEntity.ok(testCenterCode);
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteTestCenterCode(@PathVariable UUID id){
        testCenterCodeRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
