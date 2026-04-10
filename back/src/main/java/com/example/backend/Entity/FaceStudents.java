package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "face_student")
@Entity
@Builder
public class FaceStudents {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private BigInteger telegramId;
    private String phone;
    private String nickname;
    @ManyToOne
    private Student student;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
