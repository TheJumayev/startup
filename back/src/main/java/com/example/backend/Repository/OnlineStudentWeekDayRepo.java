package com.example.backend.Repository;

import com.example.backend.Entity.OnlineStudentWeekDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OnlineStudentWeekDayRepo extends JpaRepository<OnlineStudentWeekDay, UUID> {

    // ------------------- BY WEEKDAY -------------------

    // All by weekdayId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            WHERE oswd.week_day_id = :weekdayId
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByWeekdayId(@Param("weekdayId") Integer weekdayId);

    // Active only by weekdayId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            WHERE oswd.week_day_id = :weekdayId
              AND oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByWeekdayIdAndActiveTrue(@Param("weekdayId") Integer weekdayId);


    // ------------------- BY GROUP -------------------

    // All by groupId (join with students)
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            JOIN students s ON s.id = os.student_id
            WHERE s.group_id = :groupId
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByGroupId(@Param("groupId") UUID groupId);

    // Active only by groupId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            JOIN students s ON s.id = os.student_id
            WHERE s.group_id = :groupId
              AND oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByGroupIdAndActiveTrue(@Param("groupId") UUID groupId);


    // ------------------- BY GROUP + WEEKDAY -------------------

    // All by weekdayId + groupId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            JOIN students s ON s.id = os.student_id
            WHERE oswd.week_day_id = :weekdayId
              AND s.group_id = :groupId
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByWeekdayIdAndGroupId(
            @Param("weekdayId") Integer weekdayId,
            @Param("groupId") UUID groupId
    );

    // Active only by weekdayId + groupId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            JOIN students s ON s.id = os.student_id
            WHERE oswd.week_day_id = :weekdayId
              AND s.group_id = :groupId
              AND oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByWeekdayIdAndGroupIdAndActiveTrue(
            @Param("weekdayId") Integer weekdayId,
            @Param("groupId") UUID groupId
    );


    // ------------------- GENERAL -------------------

    // All active OSWD
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            WHERE oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByActiveTrue();

    // --- BY STUDENT ID ---

    // All OSWD by studentId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            WHERE os.student_id = :studentId
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByOnlineStudentStudentId(@Param("studentId") UUID studentId);

    // Active OSWD by studentId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            WHERE os.student_id = :studentId
              AND oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByOnlineStudentStudentIdAndActiveTrue(@Param("studentId") UUID studentId);

    // Single OSWD by studentId + weekdayId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            JOIN online_students os ON os.id = oswd.online_student_id
            WHERE os.student_id = :studentId
              AND oswd.week_day_id = :weekdayId
            LIMIT 1
            """, nativeQuery = true)
    Optional<OnlineStudentWeekDay> findByOnlineStudentStudentIdAndWeekdayId(
            @Param("studentId") UUID studentId,
            @Param("weekdayId") Integer weekdayId
    );

    // --- BY WEEKDAY ---

    // Active OSWD by weekdayId
    @Query(value = """
            SELECT oswd.*
            FROM online_student_week_days oswd
            WHERE oswd.week_day_id = :weekdayId
              AND oswd.active = true
            """, nativeQuery = true)
    List<OnlineStudentWeekDay> findAllByWeekday_IdAndActiveTrue(@Param("weekdayId") int weekdayId);
}
