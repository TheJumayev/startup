package com.example.backend.Repository;

import com.example.backend.Entity.AmaliyotYuklamasi;
import com.example.backend.Entity.Months;
import com.example.backend.Entity.Student;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AmaliyotYuklamasiRepo extends JpaRepository<AmaliyotYuklamasi, UUID> {

    Optional<AmaliyotYuklamasi> findByMonthAndStudent(Months month, Student student);
    @Query(value = "SELECT * FROM amaliyot_yuklamasi  WHERE student_id = :studentId AND month_id = :monthId", nativeQuery = true)
    Optional<AmaliyotYuklamasi> findByStudentIdAndMonthId(UUID studentId, UUID monthId);
    List<AmaliyotYuklamasi> findAllByStudentId(UUID studentId);
    @Query(value = """
    SELECT a.* 
    FROM amaliyot_yuklamasi a
    JOIN students s ON a.student_id = s.id
    WHERE s.group_id = :groupId
""", nativeQuery = true)
    List<AmaliyotYuklamasi> findAllByGroupId(UUID groupId);

    void deleteByMonthId(UUID monthId);
}
