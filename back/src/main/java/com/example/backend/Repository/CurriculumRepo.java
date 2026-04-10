package com.example.backend.Repository;

import com.example.backend.Entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CurriculumRepo extends JpaRepository<Curriculum,Integer> {
    @Query(value = "select * from curriculum where hemis_id=:hemisId", nativeQuery = true)
    Optional<Curriculum> findByHemisId(Integer hemisId);


}
