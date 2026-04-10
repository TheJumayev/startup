package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "dekan_group")
@Entity
@Builder
public class DekanGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToMany
    private List<Groups> group;
    @ManyToOne
    @JoinColumn(name = "dekan_id", unique = true)
    private User dekan;
    private LocalDateTime createdAt;

    public DekanGroup(List<Groups> group, LocalDateTime createdAt, User dekan) {
        this.group = group;
        this.createdAt = createdAt;
        this.dekan = dekan;
    }
}
