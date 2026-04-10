package com.example.backend.Repository;

import com.example.backend.Entity.AdminDuty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminDutyRepo extends JpaRepository<AdminDuty, UUID> {

    @Query(value = "SELECT * FROM admin_duty WHERE admin_id = :adminId", nativeQuery = true)
    Optional <AdminDuty> findByAdminId(@Param("adminId") UUID adminId);
}
