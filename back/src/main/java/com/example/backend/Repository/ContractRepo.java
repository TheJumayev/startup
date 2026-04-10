package com.example.backend.Repository;

import com.example.backend.Entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepo extends JpaRepository<Contract, UUID> {


    @Query(value = "select * from contract where hemis_id=:hemis_id", nativeQuery = true)
    Optional<Contract> findByHemisNumber( Long hemis_id);


    Contract findByHemisId(Long aLong);

    @Query(value = "select * from contract where passport_number=:passportNumber", nativeQuery = true)
    Optional<Contract> findByPassportNumber( String passportNumber);
}
