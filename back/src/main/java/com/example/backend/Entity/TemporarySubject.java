package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "temporary_subject")
@Entity
@Builder
public class TemporarySubject {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "subject_name", unique = true, nullable = false)
    private String subjectName;

    private LocalDateTime created;
}
