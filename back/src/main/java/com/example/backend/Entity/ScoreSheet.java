package com.example.backend.Entity;

import ch.qos.logback.core.util.Loader;
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
@Table(name = "score_sheet")
@Entity
@Builder
public class ScoreSheet {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private ScoreSheetGroup scoreSheetGroup;
    @ManyToOne
    private Student student;
    private Integer mustaqil;
    private Integer oraliq;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @ManyToOne
    private User marker;
    @ManyToOne
    private User lecturer;
    private Boolean isPassed;
    private String description;
    private Boolean isAccepted;
    private LocalDateTime acceptedAt;
    private String qaytnoma;
    private Integer totalNb;
    private Integer sababliNB;
    private Integer sababsizNb;
    private Boolean getIsOffice;
    @Column(length = 500)
    private String officeDescription;
    private Integer kursIshi;
    private Boolean kursIshiStatus;
    @Column(length = 500)
    private Boolean rektor;
    private String rektorDescription;

    public ScoreSheet(ScoreSheetGroup scoreSheetGroup, Student student, Integer mustaqil, Integer oraliq, LocalDateTime createdAt, Boolean kursIshiStatus) {
        this.scoreSheetGroup = scoreSheetGroup;
        this.student = student;
        this.mustaqil = mustaqil;
        this.oraliq = oraliq;
        this.createdAt = createdAt;
        this.kursIshiStatus = kursIshiStatus;
    }
}
