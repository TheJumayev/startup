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
@Table(name = "amaliyot_student")
public class AmaliyotStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Groups group;
    @ManyToOne
    private User user;
    private LocalDateTime createdAt;
    public AmaliyotStudent(Groups group, User user, LocalDateTime createdAt) {
        this.group = group;
        this.user = user;
        this.createdAt = createdAt;
    }

}
