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
@Builder
@Entity
@Table(name = "online_students")
public class OnlineStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private LocalDateTime created;
    private LocalDateTime updated;
    @OneToOne
    @JoinColumn(name = "student_id", unique = true, nullable = false)
    private Student student;

    private Boolean status;

    @ManyToOne
    private Attachment file;  //asos fayli

    public OnlineStudent(LocalDateTime created, Student student, Boolean status) {
        this.created = created;
        this.student = student;
        this.status = status;
    }

    public OnlineStudent(LocalDateTime created, Student student, Boolean status, Attachment file) {
        this.created = created;
        this.student = student;
        this.status = status;
        this.file = file;
    }
}
