package com.example.backend.Repository;

import com.example.backend.Entity.MustaqilExam;
import com.example.backend.Entity.MustaqilTalimStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface MustaqilExamRepo extends JpaRepository<MustaqilExam, UUID> {
    Optional<MustaqilExam> findByCurriculumSubjectIdAndGroupId(UUID curriculumSubjectId, UUID groupId);


}
