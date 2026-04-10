package com.example.backend.Repository;

import com.example.backend.Entity.KafolatXati;
import com.example.backend.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KafolatXatiRepo extends JpaRepository<KafolatXati, UUID> {

    @Query(value = "select * from kafolat_xati where student_id=:studentId", nativeQuery = true)
    Optional<KafolatXati> findByStudentId(UUID studentId);


    List<KafolatXati> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    Optional<KafolatXati> findTopByStudent_IdOrderByIdDesc(UUID studentId);
}
