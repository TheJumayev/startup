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
@Builder
@Entity
@Table(name = "student_explanation")
public class StudentExplanation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    private Student student;
    @ManyToOne Attachment file;
    private Integer status;
    private LocalDateTime createdAt;

    //1 bo'lsa ogohlantirish xati
    //2 hayfsan
    //3 qattiq hayfsan


}
