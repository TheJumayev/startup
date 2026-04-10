package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "homework")
@Entity
@Builder
public class Homework {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Lesson lesson;
    @Column(name = "video_url", length = 5000)
    private String videoUrl;
    @ManyToOne
    private Attachment attachment;
    private String description;
    private LocalDateTime created;
    private Boolean status;
    @ManyToMany
    private List <TestHomework> testHomework;
    private Boolean haveTest;
    private String Test;
}
