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
@Table(name = "exams")
@Entity
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private Integer hemisId;
    private String name;
    private String semesterName;
    private Integer semesterId;
    private String subjectName;
    private Integer subjectId;
    private String employeeName;
    private Integer employeeId;
    @ManyToOne
    private Groups group;
    private Integer questionCount;
    private Integer duration;
    private Integer maxBall;
    private Integer attempts;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private Integer acload;

    public Exam(Integer hemisId, String name, String semesterName, Integer semesterId, String subjectName, Integer subjectId, String employeeName, Integer employeeId, Groups group, Integer questionCount, Integer duration, Integer maxBall, LocalDateTime startTime, Integer attempts, LocalDateTime endTime, LocalDateTime createdAt) {
        this.hemisId = hemisId;
        this.name = name;
        this.semesterName = semesterName;
        this.semesterId = semesterId;
        this.subjectName = subjectName;
        this.subjectId = subjectId;
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.group = group;
        this.questionCount = questionCount;
        this.duration = duration;
        this.maxBall = maxBall;
        this.startTime = startTime;
        this.attempts = attempts;
        this.endTime = endTime;
        this.createdAt = createdAt;
    }
}
