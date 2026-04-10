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
@Entity
@Builder
@Table(name = "univer_pc")
public class UniverPc {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String address;
    private LocalDateTime createdAt;

    public UniverPc(String name, String address, LocalDateTime createdAt) {
        this.name = name;
        this.address = address;
        this.createdAt = createdAt;
    }
}
