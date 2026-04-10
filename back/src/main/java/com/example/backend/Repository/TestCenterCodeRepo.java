package com.example.backend.Repository;

import com.example.backend.Entity.TestCenterCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface TestCenterCodeRepo extends JpaRepository<TestCenterCode, UUID> {
    @Query(value = "select * from test_center_code where code=:code", nativeQuery = true)
    Optional<TestCenterCode> findByCode(Integer code);
}
