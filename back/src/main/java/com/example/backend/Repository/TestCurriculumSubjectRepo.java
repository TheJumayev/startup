package com.example.backend.Repository;

import com.example.backend.Entity.TestCurriculumSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TestCurriculumSubjectRepo extends JpaRepository<TestCurriculumSubject, UUID> {

    @Query(value = "select * from test_curriculum_subject where curriculum_subject_id = :curriculumSubjectId", nativeQuery = true)
    List<TestCurriculumSubject> findByCurriculumSubjectId(UUID curriculumSubjectId);


    @Query(value = "select count(*) from test_curriculum_subject where curriculum_subject_id = :curriculumId", nativeQuery = true)
    Integer findTestCountTestByCurriculumSubjectId(UUID curriculumId);
}
