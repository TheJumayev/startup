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
        name = "student_subjects"
)
public class StudentSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "hemis_id", nullable = false)
    private Integer hemisId;

    private Integer position;
    private String  name;

    // nested objects
    private String subjectTypeCode;
    private String subjectTypeName;

    private String examFinishCode;
    private String examFinishName;

    private String semesterCode;
    private String semesterName;

    private Integer credit;
    private Integer totalAcload;
    private Integer totalPoint;
    private Integer grade;

    private Boolean finishCreditStatus;
    private Boolean passed;

    private Boolean payed;
    private Long amount;
    private LocalDateTime payedTime;
    @ManyToOne
    private Student student;
}
