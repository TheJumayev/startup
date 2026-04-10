package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentLoginResponseDTO {
    private UUID id;
    private String fullName;
    private String login;
    private String token;
    private String refreshToken;
}

