package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CurriculmDTO {
    private UUID id;
    private String name;
    private String description;
    private UUID userId;
    private UUID subjectsId;
    private UUID groupsId;
    private LocalDate createAt;
}

