package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.MustaqilTalimTeacher;
import com.example.backend.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MustaqilTalimTeacherRepo extends JpaRepository<MustaqilTalimTeacher, UUID> {
    List<MustaqilTalimTeacher> findAllByTeacher_Id(UUID teacherId);

    List<MustaqilTalimTeacher> findByTeacherId(UUID oldTeacherId);

    Optional<MustaqilTalimTeacher> findByTeacherAndGroups(User teacher, Groups group);

    List<MustaqilTalimTeacher> findByGroups_Id(UUID groupId);
}
