package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonDTO {
    private UUID id;
    private String name;
    private UUID curriculmId;
    private List<UUID> attachmentIds;
    private LocalDateTime createdAt;
}

