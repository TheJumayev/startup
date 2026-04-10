package com.example.backend.DTO;

import com.example.backend.Entity.Attachment;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private Integer curriculumId;
    private String departmentName;
    private String educationForm;
    private String educationType;
    private String educationYear;
    private String firstName;
    private String secondName;
    private String thirdName;
    private String groupName;
    private Integer hemisId;
    private String image;
    private Boolean isOnline;
    private String level;
    private String levelName;
    private String paymentForm;
    private String semester;
    private String semesterName;
    private String shortName;
    private String specialtyName;  //4
    private String studentIdNumber; //2
    private String studentStatus;  //3
    private String yearOfEnter;
    private UUID groupId;  //1
    private String password;
    private UUID imageId;


    private Boolean nogiron;
    private String nogironText;  // luboy description
    private Integer nogironType;   //1,2,3,4  son select 1 dan 4 gacha
    private Attachment nogironFile;
    private Boolean ielts;
    private String ieltsText;   // description nechiligi
    private LocalDate endDate;  // tugash sanasi
    private Attachment ieltsFile;  //pd
    private String qabulBuyruqRaqami;
    private String kursdanOtganBuyruqRaqami;
    private String ichkiPerevodBuyruqRaqami;
    private String tashqiPerevodBuyruqRaqami;
    private String TalabalarSafidanChetlashganBuyruqRaqami;
    private LocalDate endErkinJadval;
    private String phone;


    private Boolean isHaveWork;
    private UUID workFile;


    private String fatherPhone;
    private String motherPhone;

}
