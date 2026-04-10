package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentSubjectPayedDto {
    private Long amount;
    private Integer requiredLessons;
    private UUID curriculumSubjectId;
}
