package com.example.backend.Repository;

import com.example.backend.Entity.DekanGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface DekanGroupRepo extends JpaRepository<DekanGroup, UUID> {
    @Query(value = "select * from dekan_group where dekan_id =:dekanId ", nativeQuery = true)
    Optional<DekanGroup> findByDekanId(UUID dekanId);
}
