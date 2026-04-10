package com.example.backend.Repository;

import com.example.backend.Entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepo extends JpaRepository<Department, UUID> {

    @Query(value = "select * from department where hemis_id=:deptHemisId", nativeQuery = true)
    Optional<Department> findByHemisId(Integer deptHemisId);
}
