package com.example.backend.DTO;

import com.example.backend.Entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FaceStudentsDTO {
    private BigInteger telegramId;
    private String phone;
    private Boolean isActive;
    private String nickname;
    private UUID studentId;
}
