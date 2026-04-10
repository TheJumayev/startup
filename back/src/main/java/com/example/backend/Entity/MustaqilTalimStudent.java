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
@Entity
@Builder
@Table(name = "mustaqil_talim_student")
public class MustaqilTalimStudent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    private Student student;
    @ManyToOne
    private MustaqilExam mustaqilExam;
    private Integer attempt;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer ball;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean status;
    private Boolean examPermission;
    private LocalDateTime createTime;
    private Boolean isPassed;

//    0 boshlandi admin tomondan
//    1 kirdi
//    2 vaqt tugadi
//    3 tugash knopkasini bosdi
//    nomalum sabab


    public MustaqilTalimStudent(Student student, MustaqilExam mustaqilExam, Integer attempt, Boolean status, Boolean examPermission, LocalDateTime createTime) {
        this.student = student;
        this.mustaqilExam = mustaqilExam;
        this.attempt = attempt;
        this.status = status;
        this.examPermission = examPermission;
        this.createTime = createTime;
    }
}

