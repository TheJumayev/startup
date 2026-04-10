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
@Table(name = "teacher_curriculms")
@Entity
@Builder
public class TeacherCurriculumSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private  User teacher;
    @ManyToMany
    private List<CurriculumSubject> curriculumSubject;
    @ManyToOne
    private Groups groups;
    private LocalDateTime created;
    public TeacherCurriculumSubject(User teacher, List<CurriculumSubject> curriculumSubject, Groups groups, LocalDateTime created) {
        this.teacher = teacher;
        this.curriculumSubject = curriculumSubject;
        this.groups = groups;
        this.created = created;
    }
}
