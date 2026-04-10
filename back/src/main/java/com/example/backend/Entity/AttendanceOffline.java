package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "attendance_offline")
public class AttendanceOffline {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private Student student;
    @ManyToOne
    private ScheduleList scheduleList;
    private Integer isPresent;      //1 bor, 2 yoq, 3 sababli, 0 belgilanmagan
    private Boolean isLate; //kech qoldi
    private LocalDateTime lateTime; //kech qolgan vaqti
    private String comment;       // Notes like "Absent due to illness"
    private LocalDateTime time;   //marked time
    @ManyToOne
    private Attachment file;
    @ManyToOne
    private Student markedStudent;
    @ManyToOne
    private User markedUser;
    private LocalDateTime createdAt;
    private Boolean todayOnline;


}
