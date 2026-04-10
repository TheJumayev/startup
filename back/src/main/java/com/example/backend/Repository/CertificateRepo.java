package com.example.backend.Repository;

import com.example.backend.Entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface CertificateRepo extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findTopByOrderByNumberDesc();


    @Query(value = "select * from certificate where student_id=:studentId and student_subject_id=:subjectId", nativeQuery = true)
    Optional<Certificate> findByStudentIdAndSubjectId(UUID studentId, UUID subjectId);
}
