package com.example.backend.Entity;

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
@Builder
@Entity
@Table(name = "appeal")
public class Appeal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @ManyToOne
    private AppealType appealType;
    private String text1;
    private String text2;
    @ManyToOne
    private Attachment file;
    @ManyToOne
    private Student student;
    private LocalDateTime createdAt;
    private Integer status;


//    0 - jarayonda
//    1 - qabul qilindi
//    2 - rad etildi
    private String responseText;
    @ManyToOne
    private User dekan;
    private Boolean dekanStatus;
    private LocalDateTime responseTime;
    @ManyToOne
    private Attachment responsfile;

}
