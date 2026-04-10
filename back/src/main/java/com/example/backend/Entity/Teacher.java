package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "teacher")
@Entity
@Builder
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String fullName;
    @Column(unique = true)
    private Integer hemisId;
    private String shortName;
    @Column(unique = true)
    private Long employeeIdNumber;
    private Boolean gender;  //true=>erkak
    private Long birthDate;
    private String  imageFull;
    private Boolean employeeStatus;

    @ManyToOne
    private User user;

}
