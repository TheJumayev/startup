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
@Table(name = "test_teacher")
@Entity
@Builder
public class TestTeacher {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private User teacher;
    @ManyToOne
    private CurriculumSubject curriculumSubject;

    private String ball;
    private String percentBall;

    private LocalDateTime createdAt;

    public TestTeacher(User teacher, CurriculumSubject curriculumSubject, String ball, String percentBall, LocalDateTime createdAt) {
        this.teacher = teacher;
        this.curriculumSubject = curriculumSubject;
        this.ball = ball;
        this.percentBall = percentBall;
        this.createdAt = createdAt;
    }
}
