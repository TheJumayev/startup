package com.example.backend.Repository;

import com.example.backend.Entity.AmaliyotStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AmaliyotStudentRepo extends JpaRepository<AmaliyotStudent, UUID> {
    @Query(value = "select * from amaliyot_student where user_id= :teacherId", nativeQuery = true)
    List<AmaliyotStudent> findByTeacherId(UUID teacherId);
}
