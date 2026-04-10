package com.example.backend.DTO;

import com.example.backend.Entity.ScoreSheet;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScoreSheetWithAttendanceDTO {
    private ScoreSheet scoreSheet;
    private String attendanceStudentString;
}
