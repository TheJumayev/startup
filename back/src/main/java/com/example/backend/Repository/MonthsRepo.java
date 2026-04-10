package com.example.backend.Repository;

import com.example.backend.Entity.Months;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MonthsRepo extends JpaRepository<Months, UUID> {

    List<Months> findAllByGroups_Id(UUID groupId);
}
