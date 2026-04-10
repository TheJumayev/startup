package com.example.backend.Repository;

import com.example.backend.Entity.DiscountByYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface DiscountByYearRepo extends JpaRepository<DiscountByYear,Integer> {
    @Modifying
    @Transactional
    @Query(value = "delete from discount_student_discount_by_year where discount_student_id=:studentId", nativeQuery = true)
    void deleteByStudentId(Integer studentId);
}
