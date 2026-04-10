package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    @Table(name = "lesson_file")
    @Entity
    @Builder
public class LessonFile {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Lesson lesson;
    @Column(name = "video_url", length = 5000)
    private String videoUrl;
    @ManyToOne
    private Attachment attachment;
    private LocalDateTime created;
}
