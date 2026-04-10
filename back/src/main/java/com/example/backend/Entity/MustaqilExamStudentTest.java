package com.example.backend.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "mustaqil_exam_student_test")
public class MustaqilExamStudentTest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private UUID mustaqilExamStudentId;
    @ManyToOne
    private TestMustaqilTalim testMustaqilTalim;
    @Column(length = 500)
    private String question;

    @ElementCollection
    @CollectionTable(
            name = "mustaqil_exam_test_answers",
            joinColumns = @JoinColumn(name = "mustaqil_exam_test_id")
    )
    @Column(name = "answer", length = 500)  // 🔥 TO‘G‘RI joyi shu
    private List<String> answers;

    private Integer correctAnswer;
    private Integer selectedAnswer;
    private Boolean isCorrect;
    private LocalDateTime selectedTime;
    private LocalDateTime createTime;

    public MustaqilExamStudentTest(
            UUID mustaqilExamStudentId,
            TestMustaqilTalim testMustaqilTalim,
            Integer selectedAnswer,
            LocalDateTime selectedTime,
            Boolean isCorrect,
            String question,
            List<String> answers,
            Integer correctAnswer
    ) {
        this.mustaqilExamStudentId = mustaqilExamStudentId;
        this.testMustaqilTalim = testMustaqilTalim;
        this.selectedAnswer = selectedAnswer;
        this.selectedTime = selectedTime;
        this.isCorrect = isCorrect;
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
        this.createTime = LocalDateTime.now();
    }
}
