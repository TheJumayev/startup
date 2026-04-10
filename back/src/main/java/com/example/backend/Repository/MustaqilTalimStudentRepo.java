package com.example.backend.Repository;

import com.example.backend.Entity.FinalExamStudent;
import com.example.backend.Entity.MustaqilExamStudentTest;
import com.example.backend.Entity.MustaqilTalimStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MustaqilTalimStudentRepo extends JpaRepository<MustaqilTalimStudent, UUID> {
    void deleteByMustaqilExamId(UUID id);

    @Query(value = "select * from mustaqil_talim_student where student_id=:studentId and mustaqil_exam_id=:examId", nativeQuery = true)
    Optional<MustaqilTalimStudent> findByStudentIdAndMustaqilExam(UUID studentId, UUID examId);

    @Query(value = "select * from mustaqil_talim_student where student_id=:studentId", nativeQuery = true)
    List<MustaqilTalimStudent> findByStudentId(UUID studentId);

    @Query("""
SELECT mts
FROM MustaqilTalimStudent mts
JOIN mts.mustaqilExam me
WHERE me.group.id = :groupId
  AND me.curriculumSubject.id = :curriculumSubjectId
  AND mts.student.id = :studentId
""")
    Optional<MustaqilTalimStudent> findByGroupAndCurriculumAndStudent(
            @Param("groupId") UUID groupId,
            @Param("curriculumSubjectId") UUID curriculumSubjectId,
            @Param("studentId") UUID studentId
    );
}
