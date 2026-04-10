package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningStudentSubjectDTO {
    private UUID studentSubjectId;
    private UUID curriculumSubjectId;
    private Integer requiredLessons;
}
