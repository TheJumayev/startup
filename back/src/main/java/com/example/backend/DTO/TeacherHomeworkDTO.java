package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherHomeworkDTO {
    private UUID lessonId;          // Dars ID
    private UUID attachmentId;      // Biriktirilgan fayl ID (ixtiyoriy)
    private String videoUrl;        // Video havola (ixtiyoriy)
    private String description;     // Tavsif (ixtiyoriy)
    private boolean haveTest;       // Test mavjudmi
    private String test;            // Test mazmuni yoki JSON
    private Integer ball;           // Maksimal ball
}