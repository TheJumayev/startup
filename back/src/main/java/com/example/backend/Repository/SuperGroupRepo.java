package com.example.backend.Repository;

import com.example.backend.Entity.SuperGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SuperGroupRepo extends JpaRepository<SuperGroup, UUID> {
}
