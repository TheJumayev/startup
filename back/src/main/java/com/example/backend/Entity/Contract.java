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
@Table(name = "contract")
@Entity
@Builder
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String fullName;
    private String level;
    private Long hemisId;

    private String passportNumber;
    private Integer amount;
    private Integer payment;
    private Integer debt;
    private Integer extra;
    private Integer discount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean status;

    public Contract(String fullName, String level, Long hemisId, Integer amount, Integer payment, Integer debt, Integer extra, LocalDateTime createdAt, String passportNumber, Integer discount, Boolean status) {
        this.fullName = fullName;
        this.level = level;
        this.hemisId = hemisId;
        this.amount = amount;
        this.payment = payment;
        this.debt = debt;
        this.extra = extra;
        this.createdAt = createdAt;
        this.passportNumber = passportNumber;
        this.discount = discount;
        this.status = status;
    }
}
