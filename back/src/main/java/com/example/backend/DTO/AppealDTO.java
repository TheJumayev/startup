package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppealDTO {
    private UUID appealId;
    private String description;
    private String text1;
    private String text2;
    private Integer date;
    private UUID studentId;
    private UUID fileId;
}
