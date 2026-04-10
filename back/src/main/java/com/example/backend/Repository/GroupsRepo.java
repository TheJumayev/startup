package com.example.backend.Repository;

import com.example.backend.Entity.Groups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupsRepo extends JpaRepository<Groups, UUID> {


    Optional<Object> findByHemisId(Integer hemisId);

    @Query(value = "select * from groups where hemis_id=:groupId", nativeQuery = true)
    Groups findGroupByHemisId(Integer groupId);


    @Query(value = "SELECT * FROM groups WHERE name LIKE '%-25%'", nativeQuery = true)
    List<Groups> findAllByLevel();

}
