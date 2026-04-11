package com.example.backend.Controller;

import com.example.backend.DTO.UserDTO;
import com.example.backend.Entity.User;
import com.example.backend.Repository.UserRepo;
import com.example.backend.Security.JwtService;
import com.example.backend.Services.AuthService.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService service;
    private final JwtService jwtService;
    private final UserRepo userRepo; // Ensure this is final and properly injected

    @PostMapping(value = "/login", consumes = "application/json")
    public HttpEntity<?> login(@RequestBody UserDTO dto) {
        System.out.println(dto);
        return service.login(dto);
    }

    @PostMapping("/refresh")
    public HttpEntity<?> refreshUser(@RequestParam String refreshToken) {
        return service.refreshToken(refreshToken);
    }

    @GetMapping("/decode")
    public HttpEntity<?> decode(@RequestHeader("Authorization") String token) {
        System.out.println("fuck");
        String token1 = token.replace("Bearer ", "");
        User decode = service.decode(token1);
        return ResponseEntity.ok(decode);
    }

    @GetMapping("/decode1")
    public HttpEntity<?> decode1(@RequestParam String token) {
        String token1 = token.replace("Bearer ", "");
        User decode = service.decode(token1);
        return ResponseEntity.ok(decode);
    }

    @PutMapping("/password/{adminId}")
    public HttpEntity<?> password(@RequestBody PasswordUpdateRequest request, @PathVariable UUID adminId) {
        return ResponseEntity.ok(service.password(adminId, request.getPassword()));
    }

    // Inner class for password update request
    public static class PasswordUpdateRequest {
        private String password;
        // Getters and setters
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
    }
}