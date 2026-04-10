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
@Table(name = "face_group")
@Entity
@Builder
public class FaceGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Groups group;
    private LocalDateTime createdAt;

    public FaceGroup(Groups group, LocalDateTime createdAt) {
        this.group = group;
        this.createdAt = createdAt;
    }
}
