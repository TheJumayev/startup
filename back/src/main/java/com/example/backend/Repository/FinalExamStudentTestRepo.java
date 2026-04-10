package com.example.backend.Repository;

import com.example.backend.Entity.FinalExamStudentTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinalExamStudentTestRepo extends JpaRepository<FinalExamStudentTest, UUID> {

    @Query(
            value = "SELECT * FROM final_exam_test WHERE final_exam_student_id = :finalExamStudentId ORDER BY create_time ASC",
            nativeQuery = true
    )
    List<FinalExamStudentTest> findByFinalExamStudentId(UUID finalExamStudentId);

}

