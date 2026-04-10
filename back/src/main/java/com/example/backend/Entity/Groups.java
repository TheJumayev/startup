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
@Table(name = "groups")
@Entity
@Builder
public class Groups {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(unique = true, nullable = false)
    private Integer hemisId;
    @Column(nullable = false)
    private String name;
    private Integer departmentId;
    private String departmentName;
    private String specialtyName;
    private LocalDateTime createAt;
    private Integer curriculum;

    public Groups(Integer hemisId, String name, Integer departmentId, String departmentName, String specialtyName, LocalDateTime createAt, Integer curriculum) {
        this.hemisId = hemisId;
        this.name = name;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.specialtyName = specialtyName;
        this.createAt = createAt;
        this.curriculum = curriculum;
    }
}
