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
@Builder
@Entity
@Table(name = "complete_mustaqil")
public class StudentCompleteMustaqilTalim {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Student student;
    @ManyToOne
    private MustaqilTalimCreate mustaqilTalimCreate;
    private Integer pageCounter;
    private Integer pageCount;
    private Integer attempt;
    private Boolean active;
    private Boolean completed;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
}
