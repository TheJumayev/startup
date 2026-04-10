package com.example.backend.Repository;

import com.example.backend.Entity.GroupStudent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupStudentRepo extends JpaRepository<GroupStudent,Integer> {
}
