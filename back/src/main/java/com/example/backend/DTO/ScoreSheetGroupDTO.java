package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor

@NoArgsConstructor
public class ScoreSheetGroupDTO {
    private UUID groupId;
    private UUID curriculumSubjectId;
    private UUID teacherId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String description;
    private Integer qaytnoma;
    private UUID lecturerId;
    private UUID attachmentId;
    private String attachmentName;
    private Boolean isKursIshi;



}
