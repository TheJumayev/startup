package com.example.backend.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentCompleteMustaqilTalimDTO {
    private Integer pageCounter;
    private UUID studentId;
    private UUID createMustaqilTalimId;
    private Integer pageCount;
}
