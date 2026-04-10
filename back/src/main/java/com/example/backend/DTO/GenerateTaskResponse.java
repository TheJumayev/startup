package com.example.backend.DTO;

import lombok.Data;
import java.util.List;

@Data
public class GenerateTaskResponse {
    private String title;
    private List<QuestionDTO> questions;
}