package com.example.backend.Repository;

import com.example.backend.Entity.TemporarySubject;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface TemporarySubjectRepo extends JpaRepository<TemporarySubject, UUID> {

    boolean existsBySubjectNameIgnoreCase(String subjectName);

    // Barcha nomlarni normalized ko‘rinishda olish (batch dedup uchun)
    @Query(value = "SELECT LOWER(TRIM(subject_name)) FROM temporary_subject", nativeQuery = true)
    Set<String> findAllNormalizedNames();

    /**
     * subject_name unik bo‘lsa, bor bo‘lsa e’tiborsiz qoldirib qo‘shish.
     */
    // Normalized qidiruv
    @Query(value = """
    SELECT *
    FROM temporary_subject t
    WHERE lower(
              trim(
                regexp_replace(
                  regexp_replace(t.subject_name, '[’‘ʻʼ`]', '''', 'g'),
                  '\\s+', ' ', 'g'
                )
              )
          ) = lower(
              trim(
                regexp_replace(
                  regexp_replace(:name, '[’‘ʻʼ`]', '''', 'g'),
                  '\\s+', ' ', 'g'
                )
              )
          )
    LIMIT 1
    """, nativeQuery = true)
    Optional<TemporarySubject> findBySubjectNameNormalized(@Param("name") String name);




    

    // Aniq tenglik (fallback sifatida)
    @Query(value = "SELECT * FROM temporary_subject WHERE subject_name = :name LIMIT 1",
            nativeQuery = true)
    Optional<TemporarySubject> findByName(@Param("name") String name);

    // **Normalized** qidiruv: turli apostrof belgilarini bitta `'` ga almashtirib, case-insensitive solishtiradi
    // **Normalized** qidiruv: barcha apostrof belgilarini oddiy `'` ga almashtiradi

    // Soddaroq fallback: ILIKE (case-insensitive)
    @Query(value = "SELECT * FROM temporary_subject WHERE subject_name ILIKE :name LIMIT 1",
            nativeQuery = true)
    Optional<TemporarySubject> findBySubjectNameIlike(@Param("name") String name);
}
