package com.example.backend.Repository;

import com.example.backend.Entity.Subjects;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SubjectsRepo extends JpaRepository<Subjects, UUID> {
}
