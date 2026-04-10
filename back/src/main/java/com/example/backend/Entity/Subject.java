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
@Table(name = "subjects")
@Entity
@Builder
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)

    private UUID id;
    @Column(unique = true)
    private Integer hemisId;
    private String code;
    private String name;
    private Boolean active;
    private String subjectGroupCode;
    private String subjectGroupName;
    private String educationTypeCode;
    private String educationTypeName;

    private LocalDateTime created;

}
