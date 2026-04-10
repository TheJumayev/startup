package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentExplanationDTO {
    private UUID studentId;
    private UUID explanationId;
    private UUID explanationFileId;
    private Integer status;
    //1 bo'lsa ogohlantirish xati
    //2 hayfsan
    //3 qattiq hayfsan
}
