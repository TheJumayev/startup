package com.example.backend.Repository;

import com.example.backend.Entity.FaceStudents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface FaceStudentRepo extends JpaRepository<FaceStudents, UUID> {

    @Query(value = "SELECT * FROM face_student WHERE student_id = :studentId LIMIT 1", nativeQuery = true)
    Optional<FaceStudents> findByStudent_Id(@Param("studentId") UUID studentId);
}
