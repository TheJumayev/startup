package com.example.backend.DTO;

import com.example.backend.Entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupStudentResponseDTO {
    private Student student;
    private String attendance;
    private Boolean isAttendance;
    private String grade;
    private Boolean isGrade;
    private String contract;
    private Boolean isContract;
}
