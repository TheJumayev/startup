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
@Builder
@Entity
@Table(name = "final_exam_student_history")
public class FinalExamStudentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Student student;
    @ManyToOne
    private FinalExam finalExam;
    @ManyToOne
    private  UniverPc univerPc;
    private Integer attempt;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer ball;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean permission;


    private Boolean examPermission;
    private String examPermissionText;
    private LocalDateTime examPermissionTime;
    @ManyToOne
    private Attachment examAttachment;
    private LocalDateTime createTime;
    private Integer endStatus;
    private Boolean testCenterBlock;
    private Boolean isPassed;
//    1 kirmadi
//    2 vaqt tugadi
//    3 tugash knopkasini bosdi
//    nomalum sabab

}
