package com.example.backend.Repository;

import com.example.backend.Entity.AppealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppealTypeRepo extends JpaRepository<AppealType, UUID> {
    List<AppealType> findAllByStatus(Boolean status);
}
