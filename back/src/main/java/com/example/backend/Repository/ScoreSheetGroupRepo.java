package com.example.backend.Repository;

import com.example.backend.Entity.ScoreSheetGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreSheetGroupRepo extends JpaRepository<ScoreSheetGroup, UUID> {

    @Query(value = "select * from score_sheet_group where group_id = :groupId", nativeQuery = true)
    List<ScoreSheetGroup> findByGroupId(UUID groupId);


    @Query(value = "SELECT DISTINCT * FROM score_sheet_group WHERE teacher_id = :teacherId OR lecturer_id = :teacherId", nativeQuery = true)
    List<ScoreSheetGroup> findByTeacherId(UUID teacherId);



    @Query(value = "select * from score_sheet_group where lecturer_id= :teacherId", nativeQuery = true)
    List<ScoreSheetGroup> findByLecturerId(UUID teacherId);

    Optional<ScoreSheetGroup> findByCurriculumSubject_IdAndGroup_Id(UUID curriculumSubjectId, UUID id);

    List<ScoreSheetGroup> findAllByGroup_Id(UUID groupId);

    @Query("""
       SELECT s
       FROM ScoreSheetGroup s
       WHERE s.curriculumSubject.semesterCode = :semesterCode
       AND s.group.id = :groupId
       """)
    List<ScoreSheetGroup> findAllFilter(String semesterCode, UUID groupId);
}
