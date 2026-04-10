package com.example.backend.Repository;

import com.example.backend.Entity.Dalolatnoma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DalolatnomaRepo extends JpaRepository<Dalolatnoma, UUID> {
}
