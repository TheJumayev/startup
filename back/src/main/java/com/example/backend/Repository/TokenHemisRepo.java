package com.example.backend.Repository;

import com.example.backend.Entity.TokenHemis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TokenHemisRepo extends JpaRepository<TokenHemis, Integer> {
}
