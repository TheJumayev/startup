package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.xmlbeans.impl.xb.xsdschema.Attribute;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "score_sheet_group")
@Entity
@Builder
public class ScoreSheetGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Groups group;
    @ManyToOne
//    @Column(unique = true)
    private CurriculumSubject curriculumSubject;
    @ManyToOne
    private User teacher;
    @ManyToOne
    private User lecturer;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String description;
    private String qaytnoma;
    private Boolean isKursIshi;
    private Boolean status;
    @ManyToMany
    private List<Attachment> attachments;
    }
