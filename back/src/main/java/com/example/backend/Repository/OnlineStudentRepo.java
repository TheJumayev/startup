package com.example.backend.Repository;

import com.example.backend.Entity.OnlineStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OnlineStudentRepo extends JpaRepository<OnlineStudent, UUID> {

    // Native Query
    @Query(value = """
            SELECT os.*
            FROM online_students os
                     JOIN students s ON os.student_id = s.id
                     JOIN groups g ON s.group_id = g.id
            WHERE g.id = :groupId and is_online
            """, nativeQuery = true)
    List<OnlineStudent> findByGroupId(UUID groupId);


    @Query(value = "select * from online_students where student_id=:studentId", nativeQuery = true)
    Optional<OnlineStudent> findByStudentId(UUID studentId);

    List<OnlineStudent> findAllByStatus(boolean b);
}
