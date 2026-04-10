package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.MagistrThemeTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MagistrThemeTeacherRepo extends JpaRepository<MagistrThemeTeacher,UUID> {


    @Query(value = "select * from magistr_theme_teacher where student_id=:studentId", nativeQuery = true)
    Optional<MagistrThemeTeacher> findByStudentId(UUID studentId);

    List<MagistrThemeTeacher> findAllByGroups(Groups groups);
}
