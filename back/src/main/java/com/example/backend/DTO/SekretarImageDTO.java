package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SekretarImageDTO {

    private UUID scheduleListId;

    private UUID img1Id;
    private UUID img2Id;
    private UUID img3Id;
    private UUID img4Id;
    private UUID img5Id;
    private String sekretarDescription;
}
