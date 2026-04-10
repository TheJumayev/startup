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
@Table(
        name = "mustaqil_exam",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "unique_curriculum_group",
                        columnNames = {"curriculum_subject_id", "group_id"}
                )
        }
)
@Entity
@Builder
public class MustaqilExam {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    @ManyToOne
    @JoinColumn(name = "curriculum_subject_id", nullable = false)
    private CurriculumSubject curriculumSubject;
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Groups group;
    @ManyToOne
    private User user;
    private Integer questionCount;
    private Integer maxBall;
    private Integer attempts;
    private Boolean status;
    private Integer counter;
    private Integer duration;
    private Boolean isAmaliy;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;

    public MustaqilExam(
            String name,
            CurriculumSubject curriculumSubject,
            User user,
            Groups group,
            Integer questionCount,
            Integer maxBall,
            Integer attempts,
            Boolean status,
            Integer counter,
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalDateTime createdAt,
            Integer duration,
            Boolean isAmaliy
    ) {
        this.name = name;
        this.curriculumSubject = curriculumSubject;
        this.user = user;
        this.group = group;
        this.questionCount = questionCount;
        this.maxBall = maxBall;
        this.attempts = attempts;
        this.status = status;
        this.counter = counter;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
        this.duration = duration;
        this.isAmaliy = isAmaliy;
    }
}
