package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Lesson;
import com.example.backend.Entity.TeacherCurriculumSubject;
import com.example.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface TeacherCurriculumSubjectRepo extends JpaRepository<TeacherCurriculumSubject, UUID> {

    // Get all records by teacherId
    @Query(value = "SELECT * FROM teacher_curriculms tcs WHERE tcs.teacher_id = :teacherId", nativeQuery = true)
    List<TeacherCurriculumSubject> findAllByTeacher_Id(@Param("teacherId") UUID teacherId);

    // Delete all records by teacherId
    @Query(value = "DELETE FROM teacher_curriculms WHERE teacher_id = :teacherId", nativeQuery = true)
    void deleteAllByTeacher_Id(@Param("teacherId") UUID teacherId);

    Optional<TeacherCurriculumSubject> findByTeacherAndGroups(User teacher, Groups group);

    @Query(value = "SELECT * FROM teacher_curriculms WHERE groups_id=:groupId", nativeQuery = true)
    List<TeacherCurriculumSubject> findByGroupId(UUID groupId);

    @Query(
            value = """
        SELECT 
            u.full_name AS teacherName,
            COUNT(h.id) AS totalHomework,
            SUM(CASE WHEN h.video_url IS NOT NULL AND h.video_url <> '' THEN 1 ELSE 0 END) AS videoCount,
            SUM(CASE WHEN h.attachment_id IS NOT NULL THEN 1 ELSE 0 END) AS pdfCount,
            SUM(CASE WHEN (h.have_test = true) THEN 1 ELSE 0 END) AS testCount
        FROM teacher_curriculms t
        JOIN users u ON u.id = t.teacher_id
        JOIN teacher_curriculms_curriculum_subject tcs ON tcs.teacher_curriculum_subject_id = t.id
        JOIN curriculum_subject cs ON cs.id = tcs.curriculum_subject_id
        JOIN lessons l ON l.curriculum_subject_id = cs.id
        LEFT JOIN homework h ON h.lesson_id = l.id
        GROUP BY u.full_name
    """,
            nativeQuery = true
    )
    List<Map<String, Object>> getTeacherHomeworkStatistic();
    @Query(value = "select * from teacher_curriculms where teacher_id = :teacherId", nativeQuery = true)
    List<TeacherCurriculumSubject> findByTeacherId(UUID teacherId);
}
