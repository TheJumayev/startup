package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FinalExamDTO {
    private String name;
    private UUID curriculumSubjectId;
    private UUID userId;
    private UUID groupId;
    private Integer questionCount;
    private Integer duration;
    private Integer contract;
    private Integer maxBall;
    private Integer attempts;
    private Integer status;
    private Integer counter;
    private Boolean isAmaliy;
    private Boolean isAmaliyot;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
