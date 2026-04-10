package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(
        name = "magistr_theme_teacher",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"teacher_name", "theme_name"})
        }
)
@Entity
@Builder
public class MagistrThemeTeacher {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    @Column(name = "theme_name", nullable = false)
    private String themeName;

    @ManyToOne
    private Attachment attachment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    private Student student;

    private Boolean status;

    @ManyToOne
    private Groups  groups;



}
