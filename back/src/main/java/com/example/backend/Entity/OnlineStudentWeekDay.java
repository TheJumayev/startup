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
@Table(name = "online_student_week_days")
public class OnlineStudentWeekDay {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "online_student_id")
    private OnlineStudent onlineStudent;

    @ManyToOne
    @JoinColumn(name = "week_day_id")
    private WeekDays weekday;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
