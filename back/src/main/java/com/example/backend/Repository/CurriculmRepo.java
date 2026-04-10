package com.example.backend.Repository;

import com.example.backend.Entity.Curriculm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CurriculmRepo extends JpaRepository<Curriculm, UUID> {
}
