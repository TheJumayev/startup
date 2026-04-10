package com.example.backend.Repository;

import com.example.backend.Entity.TestHomework;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TestHomeworkRepo extends JpaRepository<TestHomework, UUID> {
}