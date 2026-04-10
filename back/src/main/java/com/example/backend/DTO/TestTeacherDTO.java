package com.example.backend.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestTeacherDTO {
    private UUID teacherId;
    private UUID curriculumSubjectId;
    private String ball;
    private String percentBall;
}
