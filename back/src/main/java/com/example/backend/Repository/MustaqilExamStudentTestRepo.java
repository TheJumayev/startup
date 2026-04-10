package com.example.backend.Repository;

import com.example.backend.Entity.MustaqilExamStudentTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MustaqilExamStudentTestRepo extends JpaRepository<MustaqilExamStudentTest, UUID> {
    @Query(
            value = "SELECT * FROM mustaqil_exam_student_test WHERE mustaqil_exam_student_id= :finalExamStudentId ORDER BY create_time ASC",
            nativeQuery = true
    )
    List<MustaqilExamStudentTest> findByMustaqilExamStudentId(UUID finalExamStudentId);

}
