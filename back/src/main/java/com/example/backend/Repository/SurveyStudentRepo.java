package com.example.backend.Repository;

import com.example.backend.Entity.Student;
import com.example.backend.Entity.SurveyStudent;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface SurveyStudentRepo extends CrudRepository<SurveyStudent, UUID> {
    Optional<Object> findByStudent(Student student);


    @Query(value = "select * from survey_student where student_id=:studentId", nativeQuery = true)
    Optional<SurveyStudent> findByStudentId(UUID studentId);
}
