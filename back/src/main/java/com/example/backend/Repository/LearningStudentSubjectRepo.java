package com.example.backend.Repository;

import com.example.backend.Entity.LearningStudentSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningStudentSubjectRepo extends JpaRepository<LearningStudentSubject, UUID> {


    @Query(value = "select * from learning_student_subjects where student_subject_id=:studentSubjectId", nativeQuery = true)
    Optional<LearningStudentSubject> findByStudentSubjectId(UUID studentSubjectId);
}
