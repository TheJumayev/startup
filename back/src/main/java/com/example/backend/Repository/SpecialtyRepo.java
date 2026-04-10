package com.example.backend.Repository;

import com.example.backend.Entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SpecialtyRepo extends JpaRepository<Specialty,Integer> {

    @Query(value = "select * from specialty where hemis_id=:hemisId", nativeQuery = true)
    Optional<Specialty> findByHemisId(Integer hemisId);
}
