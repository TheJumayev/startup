package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(
        name = "learning_student_subjects",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"student_subject_id", "curriculum_subject_id"})
        }
)
public class LearningStudentSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // student_subject_id
    @ManyToOne(optional = false)
    @JoinColumn(name = "student_subject_id", nullable = false)
    private StudentSubject studentSubject;

    // curriculum_subject_id
    @ManyToOne(optional = false)
    @JoinColumn(name = "curriculum_subject_id", nullable = false)
    private CurriculumSubject curriculumSubject;

    private Integer status;
    //    1 -> o‘qishni boshladi
    //    2 -> o‘qib bo‘ldi testga kirmadi
    //    3 -> testga kirib o‘tdi
    //    4 -> testga kirib yiqildi

    private LocalDateTime createdAt;
    private Integer requiredLessons;
    private Integer readLessons;

    // lessons bilan ManyToMany
    @ManyToMany
    @JoinTable(
            name = "learning_student_subject_lessons",
            joinColumns = @JoinColumn(name = "learning_student_subject_id"),
            inverseJoinColumns = @JoinColumn(name = "lesson_id", nullable = false),
            uniqueConstraints = @UniqueConstraint(columnNames = {"learning_student_subject_id", "lesson_id"})
    )
    private List<Lesson> lessons;

    public LearningStudentSubject(StudentSubject studentSubject,
                                  Integer status,
                                  LocalDateTime createdAt,
                                  Integer requiredLessons,
                                  Integer readLessons,
                                  CurriculumSubject curriculumSubject) {
        this.studentSubject = studentSubject;
        this.status = status;
        this.createdAt = createdAt;
        this.requiredLessons = requiredLessons;
        this.readLessons = readLessons;
        this.curriculumSubject = curriculumSubject;
    }
}
