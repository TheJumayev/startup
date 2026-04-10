package com.example.backend.Repository;

import com.example.backend.Entity.ScoreSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreSheetRepo extends JpaRepository<ScoreSheet, UUID> {

    @Query(value = "select * from score_sheet where student_id=:studentId", nativeQuery = true)
    List<ScoreSheet> findByStudentId(UUID studentId);

    @Query(value = "select * from score_sheet where score_sheet_group_id=:scoreSheetGroupId", nativeQuery = true)
    List<ScoreSheet> findByScoreSheetGroupId(UUID scoreSheetGroupId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM score_sheet WHERE score_sheet_group_id = :id", nativeQuery = true)
    void deleteByScoreSheetGroupId(@Param("id") UUID id);

    Optional<ScoreSheet> findByIdAndStudentId(UUID scoreId, UUID studentId);

    @Query(value = "select * from score_sheet where score_sheet_group_id=:scoreSheetGroupId and  student_id=:studentId", nativeQuery = true)
    Optional<ScoreSheet> findByScoreSheetGroupIdAndStudentId(UUID scoreSheetGroupId, UUID studentId);


    @Modifying
    @Transactional
    @Query(value = "delete from score_sheet where student_id = :studentId", nativeQuery = true)
    void deleteByStudentId(UUID studentId);

    @Query("""
    SELECT s 
    FROM ScoreSheet s 
    WHERE s.student.id = :studentId
""")
    List<ScoreSheet> findAllByStudent(UUID studentId);

    @Query("""
        select ss from ScoreSheet ss
        join fetch ss.student st
        join fetch ss.scoreSheetGroup ssg
        join fetch ssg.group g
    """)
    List<ScoreSheet> findAllWithRelations();

    @Query("""
        select ss
        from ScoreSheet ss
        join ss.scoreSheetGroup sg
        join sg.curriculumSubject cs
        where cs.id = :subjectId
          and ss.student.id = :studentId
    """)
    Optional<ScoreSheet> findByCurriculumSubjectAndStudent(
            @Param("subjectId") UUID subjectId,
            @Param("studentId") UUID studentId
    );


    @Query(value = "select * from score_sheet where student_id = :studentId", nativeQuery = true)
    List<ScoreSheet> findAllByStudentId(UUID studentId);

    @Query("""
    SELECT s FROM ScoreSheet s
    WHERE (:studentId IS NULL OR s.student.id = :studentId)
      AND (:subjectId IS NULL OR s.scoreSheetGroup.curriculumSubject.id = :subjectId)
""")
    List<ScoreSheet> filter(
            @Param("studentId") UUID studentId,
            @Param("subjectId") UUID subjectId
    );

}
