package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.catalina.Group;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "telegram_group")
@Entity
@Builder
public class TelegramGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private BigInteger groupTelegramId;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false, unique = true)
    private Groups group;

    private LocalDateTime createdAt;
    private Boolean isActive;

    public TelegramGroup(BigInteger groupTelegramId, LocalDateTime createdAt, Groups group, Boolean isActive) {
        this.groupTelegramId = groupTelegramId;
        this.createdAt = createdAt;
        this.group = group;
        this.isActive = isActive;
    }
}
