package com.example.backend.Repository;

import com.example.backend.Entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface SubjectRepo extends JpaRepository<Subject, UUID> {

    @Query(value = "select * from subjects where hemis_id=:hemisId", nativeQuery = true)
    Optional<Subject> findByHemisId(Integer hemisId);

}
