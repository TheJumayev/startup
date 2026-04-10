package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreSheetDTO {
    private Integer oraliq;
    private Integer mustaqil;
    private Integer kursIshi;
    private UUID markerId;
    private Integer qaytnoma;
    private UUID lecturerId;
    private Boolean isPassed;
    private String description;
    private Boolean getIsOffice;
    private String officeDescription;
    private UUID studentId;
    private UUID subjectId;
}
