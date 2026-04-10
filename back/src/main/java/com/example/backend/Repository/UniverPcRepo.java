package com.example.backend.Repository;

import com.example.backend.Entity.UniverPc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UniverPcRepo extends JpaRepository<UniverPc, UUID> {
    Optional<UniverPc> findByAddress(String realIp);
}
