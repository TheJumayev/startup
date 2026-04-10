package com.example.backend.Entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "group_student")
@Entity
@Builder
public class GroupStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Student student;
    private String attendance;
    private Boolean isAttendance;
    private String grade;
    private Boolean isGrade;
    private String contract;
    private Boolean isContract;
    @ManyToOne
    private Exam exam;
    private LocalDateTime date;

    public GroupStudent(Student student, String attendance, Boolean isAttendance, String grade, Boolean isGrade, String contract, Boolean isContract, Exam exam, LocalDateTime date) {
        this.student = student;
        this.attendance = attendance;
        this.isAttendance = isAttendance;
        this.grade = grade;
        this.isGrade = isGrade;
        this.contract = contract;
        this.isContract = isContract;
        this.exam = exam;
        this.date = date;
    }
}

