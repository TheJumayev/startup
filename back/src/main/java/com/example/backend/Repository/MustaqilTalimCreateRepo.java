package com.example.backend.Repository;

import com.example.backend.Entity.MustaqilTalimCreate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MustaqilTalimCreateRepo extends JpaRepository<MustaqilTalimCreate, UUID> {
    List<MustaqilTalimCreate> findAllByCurriculumSubjectIdOrderByPositionAsc(UUID curriculmId);

    @Query(value = "select * from mustaqil_talim_create where position=:nextPosition", nativeQuery = true)
    Optional<MustaqilTalimCreate> findByPosition(int nextPosition);

    long countByCurriculumSubject_Id(UUID curriculumSubjectId);

    @Query(value = "select * from  mustaqil_talim_create where  curriculum_subject_id=:id", nativeQuery = true)
    List<MustaqilTalimCreate> findByCurriculumSubjectId(UUID id);
}
