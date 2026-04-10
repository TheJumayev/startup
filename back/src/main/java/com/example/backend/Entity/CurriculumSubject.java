package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "curriculum_subject")
@Entity
@Builder
public class CurriculumSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(unique = true)
    private Integer hemisId;
    @ManyToOne
    private Subject subject;
    private String subjectType;
    private String subjectBlock;
    @ManyToMany
    private List<SubjectDetails> subjectDetails;
    @ManyToMany
    private List<SubjectExamTypes> subjectExamTypes;
    @ManyToOne
    private Department department;
    @ManyToOne
    private Curriculum curriculum;
    private Integer totalAcload;
    private Integer resourceCount;
    private String in_group;
    private Boolean atSemester;
    private String semesterCode;
    private String semesterName;
    private Boolean active;
    private Integer credit;
    private Long created_at;
    private Long updated_at;
    private Boolean isHaveLessons;
    private LocalDateTime created;
}
