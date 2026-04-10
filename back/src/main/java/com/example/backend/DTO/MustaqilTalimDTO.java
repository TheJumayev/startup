package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MustaqilTalimDTO {
    private Boolean isAmaliy;
    private Integer position;
    private String name;
    private UUID curriculumSubjectId;
    private UUID teacherId;
    private UUID mustaqilTalimId;
    private UUID attachmentId;
    private String description;
    private String test;
    private Boolean status;
    private Boolean testActive;
}