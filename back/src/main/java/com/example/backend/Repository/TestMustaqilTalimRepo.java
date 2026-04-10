package com.example.backend.Repository;

import com.example.backend.Entity.TestCurriculumSubject;
import com.example.backend.Entity.TestMustaqilTalim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TestMustaqilTalimRepo extends JpaRepository<TestMustaqilTalim, UUID> {

}
