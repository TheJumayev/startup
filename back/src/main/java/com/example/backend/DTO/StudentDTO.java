package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDTO {
    private UUID id;
    private String fullName;
    private String login;
    private String password;
    private UUID groupsId;
    private LocalDate createAt;

    public StudentDTO(UUID id, String fullName, String login, UUID groupsId, LocalDate createAt) {
        this.id = id;
        this.fullName = fullName;
        this.login = login;
        this.groupsId = groupsId;
        this.createAt = createAt;
    }
}

