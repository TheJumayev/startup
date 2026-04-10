package com.example.backend.Repository;

import com.example.backend.Entity.Appeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppealRepo extends JpaRepository<Appeal, UUID> {

    @Query(value = "select * from appeal where appeal_type_id=:appealTypeId", nativeQuery = true)
    List<Appeal> findByAppealTypeId(UUID appealTypeId);



    @Query(value = "select * from appeal where student_id=:studentId", nativeQuery = true)
    List<Appeal> findByStudentId(UUID studentId);


    @Query(value = "select * from appeal where student_id=:studentId and appeal_type_id=:appealTypeId and status=:status ", nativeQuery = true)
    Optional<Appeal> findByStudentIdAndAppealTypeIdAndStatus(UUID studentId, UUID appealTypeId, Integer status);
    @Query(value = "select * from appeal where id=:id",  nativeQuery = true)
    Optional<Appeal> findByAppealId(UUID id);


    @Query(
            value = "select a.* from appeal a " +
                    "join students s on s.id = a.student_id " +
                    "where s.group_id = :groupId",
            nativeQuery = true
    )
    List<Appeal> findAllByGroupId(UUID groupId);

}
