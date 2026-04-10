package com.example.backend.Repository;

import com.example.backend.Entity.WeekDays;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeekDayRepo extends JpaRepository<WeekDays, Integer> {
}
