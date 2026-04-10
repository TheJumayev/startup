package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "test_mustaqil")
@Entity
@Builder
public class TestMustaqilTalim {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private Integer ball;
    @Column(length = 500)
    private String question;
    @Column(length = 500)
    private String answer1;
    @Column(length = 500)
    private String answer2;
    @Column(length = 500)
    private String answer3;
    @Column(length = 500)
    private String answer4;
    private LocalDateTime created;
}
