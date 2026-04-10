package com.example.backend.Repository;

import com.example.backend.Entity.Homework;
import com.example.backend.Entity.ResponseHomework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResponseHomeworkRepo extends JpaRepository<ResponseHomework, UUID> {
    @Query(value= "select * from response_homework where id=:homeworkId",  nativeQuery = true)
    Optional<Homework> findByIdHomeworkId(UUID homeworkId);
    @Query(value= "select * from response_homework where student_id= :studentId and homework_id= :homeworkId",  nativeQuery = true)
    Optional<ResponseHomework> findByStudentIdAndHomeworkId(UUID studentId, UUID homeworkId);
    @Query(value = "SELECT * FROM response_homework WHERE homework_id IN (:homeworkIds)", nativeQuery = true)
    List<ResponseHomework> findAllByHomeworkIdIn(@Param("homeworkIds") List<UUID> homeworkIds);
    // 🔹 Bitta homework uchun barcha javoblar
    @Query(value = "SELECT * FROM response_homework WHERE homework_id = :homeworkId", nativeQuery = true)
    List<ResponseHomework> findAllByHomeworkId(@Param("homeworkId") UUID homeworkId);
}
