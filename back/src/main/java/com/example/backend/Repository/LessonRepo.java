package com.example.backend.Repository;

import com.example.backend.Entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonRepo extends JpaRepository<Lesson, UUID> {
    @Query(value = "select * from lessons where hemis_id=:hemisId", nativeQuery = true)
    Optional<Lesson> findByHemisId(Integer hemisId);


    @Query(value = """
        SELECT * 
        FROM lessons 
        WHERE curriculum_subject_id = :curriculumSubjectId 
        ORDER BY position ASC
        """, nativeQuery = true)
    List<Lesson> findAllByCurriculumSubjectIdOrderByPositionAsc(@Param("curriculumSubjectId") UUID curriculumSubjectId);

    @Query(value = "select * from lessons where curriculum_id=:curriculumId", nativeQuery = true)
    List<Lesson> findByIdCurriculm(UUID curriculumId);


    @Query(value = "select * from lessons where curriculum_subject_id=:curriculumSubjectId and  hemis_id=:hemisId", nativeQuery = true)
    Optional<Lesson> findByHemisIdAndCurriculumSubjectId(Integer hemisId, UUID curriculumSubjectId);
}
