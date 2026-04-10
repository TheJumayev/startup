package com.example.backend.Controller;

import com.example.backend.Entity.TokenHemis;
import com.example.backend.Repository.TokenHemisRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/token")
public class TokenHemisController {

    private final TokenHemisRepo tokenHemisRepo;
    @PostMapping("/hemis/{token}")
    public HttpEntity<?> addToken(@PathVariable String token){
        tokenHemisRepo.save(new TokenHemis(token));
        return ResponseEntity.ok("Saved successfully");
    }
    @GetMapping("/hemis/token/last")
    public HttpEntity<?> getLastToken(){
        List<TokenHemis> all = tokenHemisRepo.findAll();
        return ResponseEntity.ok(all.get(all.size()-1));
    }
    @GetMapping("/hemis")
    public HttpEntity<?> getAppToken() {
        System.out.printf("Hemis Token");
        List<TokenHemis> tokenHemis=tokenHemisRepo.findAll();
        return ResponseEntity.ok(tokenHemis);
    }
    @PostMapping("/hemis")
    public HttpEntity<?> addHemis(@RequestBody TokenHemis tokenHemis) {
        tokenHemisRepo.save(tokenHemis);
        return ResponseEntity.ok("Saved successfully");
    }
    @DeleteMapping("/hemis/{id}")
    public HttpEntity<?> deleteHemis(@PathVariable Integer id) {
        tokenHemisRepo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }









}
