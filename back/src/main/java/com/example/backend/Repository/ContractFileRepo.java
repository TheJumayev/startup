package com.example.backend.Repository;

import com.example.backend.Entity.Contract;
import com.example.backend.Entity.ContractFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContractFileRepo extends JpaRepository<ContractFile, Integer> {


}
