package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.TelegramGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TelegramGroupRepo extends JpaRepository<TelegramGroup, UUID> {
    Optional<TelegramGroup> findByGroup(Groups group);
}
