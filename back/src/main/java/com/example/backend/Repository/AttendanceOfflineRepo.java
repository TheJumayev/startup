package com.example.backend.Repository;

import com.example.backend.Entity.Attendance;
import com.example.backend.Entity.AttendanceOffline;
import com.example.backend.Entity.ScheduleList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceOfflineRepo extends JpaRepository<AttendanceOffline, UUID> {

    @Query(value = """
    SELECT * 
    FROM attendance_offline 
    WHERE student_id = :studentId 
      AND is_present IN (2, 3)
""", nativeQuery = true)
    List<AttendanceOffline> findByStudentId(UUID studentId);
    // Sana bo‘yicha
    @Query(value = """
            SELECT a.*
            FROM attendance_offline a
            WHERE a.date = :date
            """, nativeQuery = true)
    List<AttendanceOffline> findByDate(@Param("date") LocalDate date);
    @Query(value = "SELECT COUNT(*) > 0 FROM attendance_ofline WHERE student_id = :studentId AND hemis_id = :hemisId", nativeQuery = true)
    boolean existsByStudentAndHemisId( UUID studentId,  Integer hemisId);



    @Query(value = """
    SELECT ao.*
    FROM attendance_offline ao
    JOIN students s ON ao.student_id = s.id
    WHERE ao.schedule_list_id = :scheduleListId
    ORDER BY s.full_name ASC
""", nativeQuery = true)
    List<AttendanceOffline> findAllByScheduleListId(UUID scheduleListId);



    @Query(value = """
    SELECT ao.*
    FROM attendance_offline ao
    JOIN schedule_list sl ON ao.schedule_list_id = sl.id
    JOIN students s ON ao.student_id = s.id
    WHERE s.is_online = true
      AND sl.lesson_date = :lessonDate
    ORDER BY s.full_name ASC
""", nativeQuery = true)
    List<AttendanceOffline> finnAllByTodaysTimestempAndStudentIsOnline(String lessonDate);




    @Query("""
    SELECT a
    FROM AttendanceOffline a
    JOIN FETCH a.scheduleList
    JOIN FETCH a.student
    WHERE a.student.id IN :studentIds
    AND a.createdAt BETWEEN :from AND :to
    ORDER BY a.createdAt ASC
""")
    List<AttendanceOffline> findByStudentsAndDateRange(
            @Param("studentIds") List<UUID> studentIds,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    Optional<AttendanceOffline> findByIdAndStudentId(UUID id, UUID studentId);

    List<AttendanceOffline> findByIsLate(boolean b);

    @Query("SELECT a FROM AttendanceOffline a " +
            "WHERE a.scheduleList.lessonDate BETWEEN :fromTs AND :toTs " +
            "ORDER BY a.scheduleList.lessonDate ASC, a.student.fullName ASC")
    List<AttendanceOffline> findAllByTimestampRange(
            @Param("fromTs") String fromTs,
            @Param("toTs") String toTs);
}
