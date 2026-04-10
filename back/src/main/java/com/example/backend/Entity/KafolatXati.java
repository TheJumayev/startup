package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "kafolat_xati")
@Entity
@Builder
public class KafolatXati {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Student student;

    @ManyToOne
    private Attachment attachment;
    @Column(length = 600)
    private String text1;

    @Column(length = 2000)
    private String text2;

    @Column(length = 600)
    private String text3;

    private String title;
    private Boolean status;
    private LocalDate date;
    private LocalDateTime createdAt;

    public KafolatXati(Student student, Attachment attachment, String title, Boolean status, LocalDate date, LocalDateTime createdAt) {
        this.student = student;
        this.attachment = attachment;
        this.title = title;
        this.status = status;
        this.date = date;
        this.createdAt = createdAt;
    }
}
