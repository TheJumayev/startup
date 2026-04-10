package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentSubjectDTO {
    private Integer credit;
    private String examFinishCode;
    private String examFinishName;
    private Integer grade;

    private Integer hemisId;  //id
    private String  name;   //name
    private Boolean passed;

    private Integer position; //position


    // nested objects
    private String subjectTypeCode;
    private String subjectTypeName;


    private String semesterCode;
    private String semesterName;

    private Integer totalAcload;
    private Integer totalPoint;

    private Boolean finishCreditStatus;

}
