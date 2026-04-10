package com.example.backend.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseHomeworkDTO {
    private UUID studentId;
    private UUID homeworkId;
    private UUID fileId;
    private Integer score;
    private Integer ball;
}
