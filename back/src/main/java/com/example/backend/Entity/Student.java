package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    @Column(unique = true, nullable = false)
    private Integer hemisId;
    private Integer metaId;
    private String fullName;
    private String shortName;
    private String firstName;
    private String secondName;
    private String thirdName;
    private String gender;
    private Long birthDate;
    private String studentIdNumber;
    private String image;
    private Double avgGpa;
    private Double avgGrade;
    private Integer totalCredit;
    private String country;
    private String province;
    private String currentProvince;
    private String district;
    private String currentDistrict;
    private String terrain;
    private String currentTerrain;
    private String citizenship;
    private String studentStatus;
    private Integer curriculumId;
    private String educationForm;
    private String educationType;
    private String paymentForm;
    private String studentType;
    private String socialCategory;
    private String accommodation;
    private String departmentName;
    private String specialtyName;

    private UUID agentId;
    private String agentName;

    private String phone;


    private String groupName;
    private String groupLang;

    private String level;
    private String levelName;

    private String semester;
    private String semesterName;

    private String educationYear;
    private Integer yearOfEnter;

    private Integer roommateCount;
    private Boolean isGraduate;

    private Integer totalAcload;
    @Column(columnDefinition = "TEXT")
    private String other;
    private String validateUrl;
    private String email;
    private String hash;
    private String password;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    @ManyToOne
    private Groups group;
    @ManyToOne
    private Attachment imageFile;
    private Boolean isOnline;
    private Boolean isMy;
    private Boolean isGroupLeader;
//    bular yangilar  bitta yangi Controller ochasan Talaba malumotini eglishga tarjima qilib va har biri uchun bitta method ochasan
    //1  "/nogiron"
    private Boolean nogiron;
    private String nogironText;  // luboy description
    private Integer nogironType;   //1,2,3,4  son select 1 dan 4 gacha
    @ManyToOne
    private Attachment nogironFile;  //only pdf
    //2  "/ielts"
    private Boolean ielts;
    private String ieltsText;   // description nechiligi
    private LocalDate endDate;  // tugash sanasi
    @ManyToOne
    private Attachment ieltsFile;  //pdf certificate
    //3  "/qabul-buyruq"
    private String qabulBuyruqRaqami;  //only text qabul buyrugu kiritadi aloxida btn boladi
    //4  "/kursdan-otgan-buyruq"
    private String kursdanOtganBuyruqRaqami;  //only text qabul buyrugu kiritadi aloxida btn boladi
    //5   "/ichki-perevod-buyruq"
    private String ichkiPerevodBuyruqRaqami;  //only text qabul buyrugu kiritadi aloxida btn boladi
    //6  "/tashqi-perevod-buyruq"
    private String tashqiPerevodBuyruqRaqami;  //only text qabul buyrugu kiritadi aloxida btn boladi
    //6   "/talabalar-safidan-chetlashgan-buyruq"
    private String TalabalarSafidanChetlashganBuyruqRaqami;  //only text qabul buyrugu kiritadi aloxida btn boladi
    // buni online qilish payti endi sana kiritadi fayl bilan birga osha joyga qoshasan
    private LocalDate endErkinJadval;   // online qilish buttonga file va sana yuklaydi endi sana oxirgi mudda boladi online tugash sanasi hisoblanadi
    //8
    private Boolean isHaveWork;
    @ManyToOne
    private Attachment workFile;
    private Long telegramId;
    private String telegramPhone;



    private String fatherPhone;
    private String motherPhone;

    @ElementCollection
    @CollectionTable(
            name = "student_achievements",
            joinColumns = @JoinColumn(name = "student_id")
    )
    @Column(name = "achievement", columnDefinition = "TEXT")
    private List<String> studentAchievements;

}
