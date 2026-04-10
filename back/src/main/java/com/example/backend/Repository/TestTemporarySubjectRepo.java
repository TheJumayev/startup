package com.example.backend.Repository;

import com.example.backend.Entity.TestTemporarySubject;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TestTemporarySubjectRepo extends JpaRepository<TestTemporarySubject, UUID> {
    List<TestTemporarySubject> findByTemporarySubject_Id(UUID temporarySubjectId);

    @Transactional
    @Modifying
    void deleteByTemporarySubject_Id(UUID temporarySubjectId);

    @Query(value = "select * from test_temporary_subject where temporary_subject_id=:temporarySubjectId", nativeQuery = true)
    List<TestTemporarySubject> findBySubjectId(UUID temporarySubjectId);
    @Query(value = "SELECT COUNT(*) FROM test_temporary_subject t WHERE t.id = :subjectId", nativeQuery = true)
    long countBySubjectId(@Param("subjectId") UUID subjectId);
}
