package com.example.backend.Repository;

import com.example.backend.Entity.UsersTelegram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersTelegramRepository extends JpaRepository<UsersTelegram, Long> {

    Optional<Object> findByTelegramId(Long telegramId);
}
