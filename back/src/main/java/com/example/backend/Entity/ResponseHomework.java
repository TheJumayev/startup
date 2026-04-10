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
@Table(name = "response_homework")
@Entity
@Builder
public class ResponseHomework {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Homework homework;
    @ManyToOne
    private Student student;
    private Integer score;
    private Boolean gradedStatus;
    @ManyToOne
    private Attachment attachment;
    private LocalDateTime created;
    @Builder.Default
    private Boolean isSend = false;
    private Integer ball;


    public ResponseHomework(Homework homework, Student student, Attachment attachment, LocalDateTime created, Boolean isSend, Integer ball) {
        this.homework = homework;
        this.student = student;
        this.attachment = attachment;
        this.created = created;
        this.isSend = isSend;
        this.ball = ball;
    }
}
