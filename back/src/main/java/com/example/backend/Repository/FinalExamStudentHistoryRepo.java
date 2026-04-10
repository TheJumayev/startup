package com.example.backend.Repository;

import com.example.backend.Entity.FinalExamStudentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FinalExamStudentHistoryRepo extends JpaRepository<FinalExamStudentHistory, UUID> {
    void deleteByFinalExamId(UUID id);

}
