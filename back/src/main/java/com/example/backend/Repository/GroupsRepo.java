package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GroupsRepo extends JpaRepository<Groups, UUID> {
}
