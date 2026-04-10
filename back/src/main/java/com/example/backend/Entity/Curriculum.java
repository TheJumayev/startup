package com.example.backend.Entity;

import com.example.backend.Repository.SpecialtyRepo;
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
@Table(name = "curriculum")
@Entity
@Builder
public class Curriculum {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(unique = true)
    private Integer hemisId;
    @ManyToOne
    private Specialty specialty;
    private Integer educationYearCode;
    private String educationYearName;
    private String educationTypeName;
    private Integer semester_count;
    private Integer education_period;
    private LocalDateTime created;
}
