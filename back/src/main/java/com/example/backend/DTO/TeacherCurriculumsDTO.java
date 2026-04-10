package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherCurriculumsDTO {
    private UUID teacherId;
    private List<UUID> curriculumSubjectIds;
    private UUID groupIds;


}
