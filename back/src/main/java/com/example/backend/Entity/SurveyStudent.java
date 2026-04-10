package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(
        name = "survey_student",
        uniqueConstraints = @UniqueConstraint(columnNames = "student_id") // 🔒 One submission per student
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // 🔹 7 questions with teacher selection
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q1_id")
    private Teacher teacherQ1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q2_id")
    private Teacher teacherQ2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q3_id")
    private Teacher teacherQ3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q4_id")
    private Teacher teacherQ4;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q5_id")
    private Teacher teacherQ5;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q6_id")
    private Teacher teacherQ6;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_q7_id")
    private Teacher teacherQ7;

    // 🔸 3 Boolean (Yes/No) questions
    @Column(nullable = false)
    private Boolean answer1; // e.g. Kurs mazmuni foydalimi?

    @Column(nullable = false)
    private Boolean answer2; // e.g. Dars sifatidan qoniqdingizmi?

    @Column(nullable = false)
    private Boolean answer3; // e.g. Bu universitetni boshqalarga tavsiya qilasizmi?

    private Date createdAt = new Date();
}
