package com.example.backend.Repository;

import com.example.backend.Entity.FaceGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FaceGroupRepo extends JpaRepository<FaceGroup, UUID> {
}
