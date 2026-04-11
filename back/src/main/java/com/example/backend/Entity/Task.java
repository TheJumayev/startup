package com.example.backend.Entity;

import com.example.backend.Enums.TaskType;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TaskType type; // TEST / SELF

    private boolean approved = false;

    @ManyToOne
    private User teacher;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskQuestion> questions;

    @ManyToOne
    private Lesson lesson;
}