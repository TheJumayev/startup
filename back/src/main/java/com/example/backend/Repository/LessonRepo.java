package com.example.backend.Repository;

import com.example.backend.Entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepo extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByCurriculmId(UUID curriculmId);
}
