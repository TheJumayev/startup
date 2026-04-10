package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "mustaqil_talim_create",
uniqueConstraints = {
@UniqueConstraint(
        name = "uk_position_curriculum_subject",
        columnNames = {"position", "curriculum_subject_id"}
)
})
@Entity
@Builder
public class MustaqilTalimCreate {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String description;
    private Boolean isAmaliy;
    @Column(nullable = false)
    private Integer position;
    @ManyToOne
    @JoinColumn(nullable = false)
    private CurriculumSubject curriculumSubject;
    @ManyToOne
    private Attachment attachment;
    private Boolean status;
    private Boolean testActive;
    @ManyToMany
    private List<TestMustaqilTalim> testMustaqilTalim;
    private LocalDateTime createdAt;
}
