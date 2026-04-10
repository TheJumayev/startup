package com.example.backend.Repository;

import com.example.backend.Entity.Curriculum;
import com.example.backend.Entity.CurriculumSubject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface CurriculumSubjectRepo extends JpaRepository<CurriculumSubject, UUID> {

    @Query(value = """
        SELECT cs.*
        FROM curriculum_subject cs
        WHERE (CAST(:subjectId    AS uuid) IS NULL OR cs.subject_id    = CAST(:subjectId    AS uuid))
          AND (CAST(:departmentId AS uuid) IS NULL OR cs.department_id = CAST(:departmentId AS uuid))
          AND (CAST(:curriculumId AS uuid) IS NULL OR cs.curriculum_id = CAST(:curriculumId AS uuid))
        ORDER BY cs.created DESC, cs.id
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM curriculum_subject cs
        WHERE (CAST(:subjectId    AS uuid) IS NULL OR cs.subject_id    = CAST(:subjectId    AS uuid))
          AND (CAST(:departmentId AS uuid) IS NULL OR cs.department_id = CAST(:departmentId AS uuid))
          AND (CAST(:curriculumId AS uuid) IS NULL OR cs.curriculum_id = CAST(:curriculumId AS uuid))
        """,
            nativeQuery = true)
    Page<CurriculumSubject> filterNative(
            @Param("subjectId") UUID subjectId,
            @Param("departmentId") UUID departmentId,
            @Param("curriculumId") UUID curriculumId,
            Pageable pageable
    );



    @Query(value = "SELECT * FROM curriculum_subject WHERE hemis_id = :hemisId", nativeQuery = true)
    Optional<CurriculumSubject> findByHemisId(@Param("hemisId") Integer hemisId);





    @Query(value = """
    SELECT cs.* 
    FROM curriculum_subject cs 
    JOIN curriculum c ON cs.curriculum_id = c.id 
    WHERE c.education_year_code = :year1 or c.education_year_code = :year2
    """, nativeQuery = true)
    List<CurriculumSubject> findAllByCurriculumYear( Integer year1,  Integer year2);



    @Query(value = "select cs.*  from curriculum_subject cs join curriculum c on cs.curriculum_id = c.id  join subjects s on cs.subject_id = s.id where c.hemis_id=:curriculum", nativeQuery = true)
    List<CurriculumSubject> findByGroupCurriculum(Integer curriculum);



    @Query(value = "select cs.* from curriculum_subject cs join curriculum c on c.id=cs.curriculum_id join students s on s.curriculum_id=c.hemis_id join subjects sub on cs.subject_id=sub.id where s.id=:studentId", nativeQuery = true)
    List<CurriculumSubject> findByStudentId(UUID studentId);



    @Query(value = "select * from curriculum_subject where subject_id=:subjectId and semester_code=:semesterCode ", nativeQuery = true)
    List<CurriculumSubject> findBySubjectIdAndSemesterCode(UUID subjectId, String semesterCode);

}
