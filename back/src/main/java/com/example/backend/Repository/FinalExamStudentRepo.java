package com.example.backend.Repository;

import com.example.backend.Entity.FinalExamStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinalExamStudentRepo extends JpaRepository<FinalExamStudent, UUID> {
    Optional<FinalExamStudent> findByStudentIdAndFinalExamId(UUID id, UUID finalExamId);

    List<FinalExamStudent> findByFinalExamId(UUID finalExamId);

    List<FinalExamStudent> findByStudentId(UUID studentId);

    void deleteByFinalExamId(UUID finalExamId);

    @Query("""
    SELECT f.ball 
    FROM FinalExamStudent f
    WHERE f.student.id = :studentId AND f.finalExam.curriculumSubject.id = :subjectId
""")
    Optional<Integer> findBall(UUID studentId, UUID subjectId);

    @Query("select f.attempt from FinalExamStudent f where f.student.id = :studentId and f.finalExam.curriculumSubject.id = :subjectId")
    Optional<Integer> findAttempt(UUID studentId, UUID subjectId);

    @Query("""
select distinct fes from FinalExamStudent fes
join fetch fes.student s
join fetch s.group g
join fetch fes.finalExam fe
join fetch fe.curriculumSubject cs
""")
    List<FinalExamStudent> findAllWithStudentAndExamAndGroup();


}
