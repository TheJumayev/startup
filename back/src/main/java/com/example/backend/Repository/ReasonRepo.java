package com.example.backend.Repository;

import com.example.backend.Entity.Reason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ReasonRepo extends JpaRepository<Reason, UUID> {


    @Query(value = "select * from reason where appeal_type_id=:appealTypeId", nativeQuery = true)
    List<Reason> findByAppealTypeId(UUID appealTypeId);
}
