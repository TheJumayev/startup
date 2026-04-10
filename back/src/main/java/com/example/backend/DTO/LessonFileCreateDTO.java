package com.example.backend.DTO;

import lombok.Data;

import java.util.UUID;

@Data
public class LessonFileCreateDTO {
    private UUID lessonId;
    private UUID attachmentId;
    private String video;
}
