package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@Data
@Builder
@NoArgsConstructor
@Entity
@Table(name = "schedule_list")
public class ScheduleList {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(name = "hemis_id", nullable = false)
    private Integer hemisId;
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Groups groups;


    @ManyToOne
    private Subject subject;



    private   String semesterCode;
    private   String semesterName;

    private String auditoriumName;
    private Integer auditoriumCode;

    private String trainingTypeName;
    private Integer trainingTypeCode;

    private String lessonPairName;
    private Integer lessonPairCode;

    private String start_time;
    private String end_time;
    private Integer employeeId;
    private String employeeName;

    @ManyToMany
    @JoinTable(
            name = "schedule_list_attachments",
            joinColumns = @JoinColumn(name = "schedule_list_id"),
            inverseJoinColumns = @JoinColumn(name = "attachment_id")
    )
    private List<Attachment> attachment;

    private LocalDateTime uploadedAttachmentTime;
    private String sekretarDescription;


    private Integer isChecked;  //0-not students //1-not checked //2-checked
    private Integer isOnlineChecked; //0-not students //1-not checked //2-checked

    private String lessonDate;    //timestap
    private String weekStartTime;    //timestap
    private String weekEndTime;    //timestap
    private LocalDateTime createdAt;

}
