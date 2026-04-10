package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentRegisterDTO {
    private String fullName;
    private String login;
    private String password;
    private String passwordConfirm;
    private UUID groupsId;
}

