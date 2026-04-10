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
@Table(name = "appeal_type")
public class AppealType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String name;
    private String description;
    private String text1;
    private String text2;
    private String text3;
    private Boolean isText3;
    private Boolean proof;
    private Integer date;
    //0- sana yoq
    //1- 1 ta sana
    //2- 2 ta sana
    private Boolean reason;
    private LocalDateTime createdAt;
    private Boolean status;


    public AppealType(String name, String description, String text1, String text2, Boolean proof, Integer date, Boolean reason) {
        this.name = name;
        this.description = description;
        this.text1 = text1;
        this.text2 = text2;
        this.proof = proof;
        this.date = date;
        this.reason = reason;
    }


    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
