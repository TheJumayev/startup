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
@Table(name = "test_center_code")
@Entity
@Builder
public class TestCenterCode {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private Integer code;
    private LocalDateTime createTime;

    public TestCenterCode(Integer code, LocalDateTime createTime) {
        this.code = code;
        this.createTime = createTime;
    }
}
