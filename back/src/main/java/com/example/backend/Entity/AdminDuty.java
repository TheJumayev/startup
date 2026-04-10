package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "admin_duty")
public class AdminDuty {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private User admin;
    @ManyToMany
    private List<AppealType> appealType;
    private LocalDateTime createAt;

    public AdminDuty(LocalDateTime createAt, User admin, List<AppealType> appealType) {
        this.createAt = createAt;
        this.admin = admin;
        this.appealType = appealType;
    }
}
