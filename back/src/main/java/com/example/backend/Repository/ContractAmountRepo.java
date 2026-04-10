package com.example.backend.Repository;


import com.example.backend.Entity.ContractAmount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractAmountRepo extends JpaRepository<ContractAmount,Integer> {
}
