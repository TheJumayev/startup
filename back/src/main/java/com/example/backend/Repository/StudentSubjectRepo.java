package com.example.backend.Repository;

import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentSubject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentSubjectRepo extends JpaRepository<StudentSubject, UUID> {
    @Query(value = """
        SELECT DISTINCT st.*
        FROM student_subjects ss
        JOIN students st ON st.id = ss.student_id
        WHERE st.group_id = :groupId
          AND COALESCE(ss.passed, false) = false
          AND (:examOnly = false OR ss.exam_finish_name ILIKE 'Imtihon')
        ORDER BY st.full_name
        """, nativeQuery = true)
    List<Student> findStudentsNotPassedByGroup(
            @Param("groupId") UUID groupId,
            @Param("examOnly") boolean examOnly
    );

    // All NOT PASSED StudentSubject rows for students in the group
    @Query(value = """
        SELECT ss.*
        FROM student_subjects ss
        JOIN students st ON st.id = ss.student_id
        WHERE st.group_id = :groupId
          AND COALESCE(ss.passed, false) = false
          AND (:examOnly = false OR ss.exam_finish_name ILIKE 'Imtihon')
        ORDER BY st.full_name, ss.position
        """, nativeQuery = true)
    List<StudentSubject> findNotPassedSubjectsByGroup(
            @Param("groupId") UUID groupId,
            @Param("examOnly") boolean examOnly
    );



    @Query(value = "SELECT * FROM student_subjects WHERE student_id = :studentId ORDER BY position ASC", nativeQuery = true)
    List<StudentSubject> findAllByStudent_IdOrderByPositionAsc(@Param("studentId") UUID studentId);

    @Query(value = "SELECT * FROM student_subjects WHERE student_id = :studentId AND hemis_id = :hemisId LIMIT 1", nativeQuery = true)
    Optional<StudentSubject> findByStudent_IdAndHemisId(@Param("studentId") UUID studentId,
                                                        @Param("hemisId") Integer hemisId);




    @Query(value = """
        SELECT ss.*
        FROM student_subjects ss
        WHERE ss.student_id IN (:studentIds)
          AND COALESCE(ss.passed, false) = false
          AND (:examOnly = false OR ss.exam_finish_name ILIKE 'Imtihon')
        ORDER BY ss.position
        """, nativeQuery = true)
    List<StudentSubject> findNotPassedSubjectsForStudents(
            @Param("studentIds") List<UUID> studentIds,
            @Param("examOnly") boolean examOnly
    );


    @Query(value = "select * from student_subjects where student_id=:studentId", nativeQuery = true)
    List<StudentSubject> findByStudentId(UUID studentId);



    @Query(value = """
    SELECT ss.*
    FROM student_subjects ss
    WHERE COALESCE(ss.passed, false) = false
    ORDER BY ss.student_id, ss.position
    """,
            countQuery = """
    SELECT COUNT(*)
    FROM student_subjects ss
    WHERE COALESCE(ss.passed, false) = false
    """,
            nativeQuery = true)
    Page<StudentSubject> findAllDebtStudents(Pageable pageable);


    @Query(value = """
    SELECT DISTINCT name
    FROM student_subjects
    WHERE name IS NOT NULL AND trim(name) <> '' 
    ORDER BY name
    """, nativeQuery = true)
    List<String> findAllUniqueSubjectNames();

    @Query(value = """
    SELECT DISTINCT name
    FROM student_subjects
    WHERE name IS NOT NULL
      AND trim(name) <> ''
      AND passed = false
    ORDER BY name
    """, nativeQuery = true)
    List<String> findAllUniqueFailedSubjectNames();


    Optional<StudentSubject> findByStudent_IdAndHemisIdAndSemesterCode(UUID studentId, Integer hemisId, String semesterCode);
}
