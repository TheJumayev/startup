package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "certificate")
@Entity
@Builder
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    private Student student;
    @ManyToOne
    private StudentSubject studentSubject;
    private LocalDateTime created;
    private String ball;

    @Column(unique = true)
    private Integer number;

    public Certificate(Student student, StudentSubject studentSubject, LocalDateTime created, String ball) {
        this.student = student;
        this.studentSubject = studentSubject;
        this.created = created;
        this.ball = ball;
    }

}
