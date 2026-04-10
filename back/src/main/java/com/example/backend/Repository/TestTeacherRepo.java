package com.example.backend.Repository;

import com.example.backend.Entity.TestTeacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TestTeacherRepo extends JpaRepository<TestTeacher, UUID> {

}