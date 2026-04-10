package com.example.backend.Repository;

import com.example.backend.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentRepo extends JpaRepository<Student, UUID> {
}
