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
@Table(name = "lesson")
@Entity
@Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    @ManyToOne
    @JoinColumn(name = "curriculm_id", referencedColumnName = "id",
            foreignKey = @ForeignKey(name = "fk_lesson_curriculm"))
    private Curriculm curriculm;
    @ManyToMany
    private List<Attachment> attachment;
    private LocalDateTime createdAt;

}
