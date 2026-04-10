package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HisobotDTO {
    private String studentName;
    private String subjectName;
    private UUID curriculumId;
    private Integer mustaqil;
    private Integer oraliq;
    private Integer yakuniy;
    private Integer jami;
}
