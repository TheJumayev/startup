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
@Builder
@Entity
@Table(
        name = "lessons",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"hemis_id", "curriculum_subject_id"})
        }
)
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(name = "hemis_id")
    private Integer hemisId;
    @Column(length = 500)
    private String name;
    private Integer topic_load;
    private Integer position;
    @ManyToOne
    @JoinColumn(name = "curriculum_subject_id")
    private CurriculumSubject curriculumSubject;
    private Boolean active;
    private Integer department;
    private Integer semester;
    private Integer trainingType;
    private Long createdAt;
    private Long updatedAt;
    private LocalDateTime created;
    private Boolean isMy;
    private Boolean isPresent;
}
