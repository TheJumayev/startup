package com.example.backend.Repository;

import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.LessonFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LessonFIleRepo extends JpaRepository<LessonFile, UUID> {
    @Query(value = """
        SELECT * 
        FROM lesson_file 
        WHERE lesson_id = :lessonId 
        ORDER BY created DESC
        """, nativeQuery = true)
    List<LessonFile> findAllByLessonIdOrderByCreatedDesc(@Param("lessonId") UUID lessonId);
}
