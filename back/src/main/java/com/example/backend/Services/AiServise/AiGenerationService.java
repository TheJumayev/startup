package com.example.backend.Services.AiServise;

import com.example.backend.DTO.GenerateTaskResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiGenerationService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public GenerateTaskResponse generate(String text, String type) {

        String prompt;

        if (type.equals("TEST")) {
            prompt = """
            Сгенерируй 5 тестовых вопросов из текста.
            Формат JSON:
            {
              "title": "Название",
              "questions": [
                {
                  "question": "...",
                  "optionA": "...",
                  "optionB": "...",
                  "optionC": "...",
                  "optionD": "...",
                  "correctAnswer": "A"
                }
              ]
            }
            Текст:
            """ + text;
        } else {
            prompt = """
            Сгенерируй самостоятельные задания.
            Формат JSON:
            {
              "title": "Название",
              "questions": [
                {
                  "question": "..."
                }
              ]
            }
            Текст:
            """ + text;
        }

        try {
            String aiResponse = geminiService.generate(prompt);

            return objectMapper.readValue(aiResponse, GenerateTaskResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("Ошибка AI парсинга");
        }
    }
}