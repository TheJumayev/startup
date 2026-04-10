package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CurriculumSubjectTestDTO {
    private String question;
    private String correctAnswer;
    private String Answer1;
    private String Answer2;
    private String Answer3;
}
