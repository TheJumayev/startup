package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users_telegram")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsersTelegram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "username", length = 255)
    private String username;

    @Column(name = "telegram_id", nullable = false, unique = true)
    private Long telegramId;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "status", nullable = false)
    private Boolean status = false;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "passport_number", length = 20)
    private String passportNumber;

    @Column(name = "hemis_id", length = 14)
    private String hemisId;

    @Column(name = "password", length = 20)
    private String password;
    @ManyToOne
    private Student student;

    private Boolean isParent;
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = false;
        }
    }
}