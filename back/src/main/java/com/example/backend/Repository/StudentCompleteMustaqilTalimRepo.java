package com.example.backend.Repository;

import com.example.backend.Entity.StudentCompleteMustaqilTalim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentCompleteMustaqilTalimRepo extends JpaRepository<StudentCompleteMustaqilTalim, UUID> {

    Optional<StudentCompleteMustaqilTalim>
    findByStudent_IdAndMustaqilTalimCreate_Id(
            UUID studentId,
            UUID mustaqilTalimCreateId
    );

    Optional<StudentCompleteMustaqilTalim>
    findByStudent_IdAndMustaqilTalimCreate_IdAndActiveTrue(UUID studentId, UUID lessonId);

    List<StudentCompleteMustaqilTalim>
    findAllByStudent_IdAndMustaqilTalimCreate_IdOrderByAttemptDesc(UUID studentId, UUID lessonId);

    @Query("""
        SELECT MAX(s.attempt)
        FROM StudentCompleteMustaqilTalim s
        WHERE s.student.id = :studentId
          AND s.mustaqilTalimCreate.id = :lessonId
    """)
    Optional<Integer> findMaxAttempt(
            @Param("studentId") UUID studentId,
            @Param("lessonId") UUID lessonId
    );


    @Query(value = "select * from complete_mustaqil where completed and student_id = :studentId and mustaqil_talim_create_id=:lessonId", nativeQuery = true)
    List<StudentCompleteMustaqilTalim> findByCompletedAndStudentIdAndLessonId(UUID studentId, UUID lessonId);


    @Query("""
SELECT COUNT(DISTINCT sc.mustaqilTalimCreate.id)
FROM StudentCompleteMustaqilTalim sc
WHERE sc.student.id = :studentId
  AND sc.mustaqilTalimCreate.curriculumSubject.id = :curriculumSubjectId
  AND sc.completed = true
""")
    long countCompletedDistinctTopics(
            @Param("studentId") UUID studentId,
            @Param("curriculumSubjectId") UUID curriculumSubjectId
    );
}
