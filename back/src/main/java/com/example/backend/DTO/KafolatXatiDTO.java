package com.example.backend.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KafolatXatiDTO {
    private UUID attachmentId;
    private UUID studentId;
    private String text1;
    private String text2;
    private String text3;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private Boolean status;
    private String title;
}
