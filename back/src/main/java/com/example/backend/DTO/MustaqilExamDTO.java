package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MustaqilExamDTO {
    private String name;
    private UUID curriculumSubjectId;
    private UUID userId;
    private UUID groupId;
    private Integer maxBall;
    private Integer attempts;
    private Boolean status;
    private Integer counter;
    private Boolean isAmaliy;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
