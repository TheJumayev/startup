package com.example.backend.Repository;

import com.example.backend.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRepo extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByEmployeeIdNumber(Long employeeIdNumber);

    @Query(value = "select * from teacher where employee_id_number", nativeQuery = true)
    List<Teacher> findAllAndEmployeeStatus(boolean b);
}
