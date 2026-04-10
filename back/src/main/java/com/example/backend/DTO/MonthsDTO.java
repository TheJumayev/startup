package com.example.backend.DTO;

import com.example.backend.Entity.Groups;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthsDTO {
    private UUID groupId;
    private String deadline;
    private String month;
    private String description;
}
