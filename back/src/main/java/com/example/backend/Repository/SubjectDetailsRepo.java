package com.example.backend.Repository;

import com.example.backend.Entity.Department;
import com.example.backend.Entity.SubjectDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface SubjectDetailsRepo extends JpaRepository<SubjectDetails, UUID> {
    @Query(value = "select * from subject_details where hemis_id=:detailHemisId", nativeQuery = true)
    Optional<SubjectDetails> findByHemisId(Integer detailHemisId);
}
