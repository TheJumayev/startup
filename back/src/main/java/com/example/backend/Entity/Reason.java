package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "reason")
public class Reason {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    @ManyToOne
    private AppealType appealType;
    private LocalDateTime createdAt;

    public Reason(String name) {
        this.name = name;
    }


    public Reason(AppealType appealType, String name, LocalDateTime createdAt) {
        this.appealType = appealType;
        this.name = name;
        this.createdAt = createdAt;
    }
}
