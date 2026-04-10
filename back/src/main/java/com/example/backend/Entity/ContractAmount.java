package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "contract_amount")
@Entity
@Builder
public class ContractAmount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer amount;
    private LocalDateTime createdAt;

    public ContractAmount(Integer amount) {
        this.amount = amount;
    }

    public ContractAmount(Integer amount, LocalDateTime createdAt) {
        this.amount = amount;
        this.createdAt = createdAt;
    }
}
