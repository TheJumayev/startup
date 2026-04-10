package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity

@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "unique_online_student_week_day_hemis",
                        columnNames = {"online_student_week_day_id", "hemis_id"}
                )
        }
)
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "online_student_week_day_id", nullable = false)
    private OnlineStudentWeekDay onlineStudentWeekDay;

    @Column(name = "hemis_id", nullable = false)
    private Integer hemisId;

    private Integer subjectId;
    private String subjectName;
    private String subjectCode;
    private Integer semesterId;
    private String semesterName;
    private String trainingTypeName;
    private String lessonPairName;
    private String start_time;
    private String end_time;
    private Integer employeeId;
    private String employeeName;
    private LocalDateTime updateTime;
    private LocalDateTime date;   // Example: 2025-09-06 10:30
    private Boolean present;      // true = attended, false = absent
    private String comment;       // Notes like "Absent due to illness"
    private String lessonDate;    //timestap

    public Attendance(Integer hemisId,
                      OnlineStudentWeekDay onlineStudentWeekDay,
                      Integer subjectId,
                      String subjectName,
                      String subjectCode,
                      Integer semesterId,
                      String semesterName,
                      String trainingTypeName,
                      String lessonPairName,
                      String start_time,
                      String end_time,
                      Integer employeeId,
                      String employeeName,
                      LocalDateTime date,
                      String lessonDate) {
        this.hemisId = hemisId;
        this.onlineStudentWeekDay = onlineStudentWeekDay;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.trainingTypeName = trainingTypeName;
        this.lessonPairName = lessonPairName;
        this.start_time = start_time;
        this.end_time = end_time;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.date = date;
        this.lessonDate = lessonDate;
    }
}
