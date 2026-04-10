package com.example.backend.Repository;

import com.example.backend.Entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HomeworkRepo extends JpaRepository<Homework, UUID> {
    List<Homework> findByLesson_CurriculumSubject_IdOrderByCreatedDesc(UUID curriculumSubjectId);
    @Query(value = "select * from homework where lesson_id=:lessonId",  nativeQuery = true)
    List<Homework> findAllByLessonId(UUID lessonId);

}
