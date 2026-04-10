package com.example.backend.Repository;

import com.example.backend.Entity.FinalExam;
import com.example.backend.Entity.FinalExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinalExamRepo extends JpaRepository<FinalExam, UUID> {
    Optional<FinalExam> findByCurriculumSubjectIdAndGroupId(UUID curriculumSubjectId, UUID groupId);

    List<FinalExam> findByGroupId(UUID groupId);

    @Query("""
            select fe.curriculumSubject.id, fe.isAmaliyot
            from FinalExam fe
            where fe.curriculumSubject is not null
           """)
    List<Object[]> findSubjectAmaliyotPairs();
    @Query("""
SELECT fe FROM FinalExam fe
WHERE fe.curriculumSubject.semesterCode = :semesterCode
AND fe.group.id = :groupId
""")
    List<FinalExam> findAllFilter(
            String semesterCode,
            UUID groupId
    );
}
