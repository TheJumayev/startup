package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupsDTO {
    private UUID id;
    private String name;
    private String description;
    private String semesterName;
    private LocalDateTime createdAt;
}

