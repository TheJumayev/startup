package com.example.backend.Repository;

import com.example.backend.Entity.Attendance;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepo extends JpaRepository<Attendance, UUID> {

    // Student bo‘yicha (join orqali: attendance → online_student_week_days → online_students → students)
    @Query(value = """
            SELECT a.* 
            FROM attendance a
            JOIN online_student_week_days oswd ON a.online_student_week_day_id = oswd.id
            JOIN online_students os ON oswd.online_student_id = os.id
            JOIN students s ON os.student_id = s.id
            WHERE s.id = :studentId
            """, nativeQuery = true)
    List<Attendance> findByStudentId(@Param("studentId") UUID studentId);

    // Sana bo‘yicha
    @Query(value = """
            SELECT a.*
            FROM attendance a
            WHERE a.date = :date
            """, nativeQuery = true)
    List<Attendance> findByDate(@Param("date") LocalDate date);

    // Sana oralig‘ida (hafta uchun kerak)
    @Query(value = """
            SELECT a.*
            FROM attendance a
            WHERE a.date BETWEEN :start AND :end
            """, nativeQuery = true)
    List<Attendance> findByDateBetween(@Param("start") LocalDate start,
                                       @Param("end") LocalDate end);


    // OnlineStudentWeekDay → OnlineStudent → Student orqali studentId bo‘yicha
    @Query(value = """
            SELECT a.* 
            FROM attendance a
            JOIN online_student_week_days oswd ON a.online_student_week_day_id = oswd.id
            JOIN online_students os ON oswd.online_student_id = os.id
            JOIN students s ON os.student_id = s.id
            WHERE s.id = :studentId
            """, nativeQuery = true)
    List<Attendance> findByOnlineStudentWeekDay_OnlineStudent_Student_Id(@Param("studentId") UUID studentId);


    Optional<Object> findFirstByOnlineStudentWeekDay_IdAndSubjectIdAndDateBetween(UUID id, Integer subjectId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query(value = """
        SELECT a.*
        FROM attendance a
        JOIN online_student_week_days oswd ON a.online_student_week_day_id = oswd.id
        JOIN week_days wd ON oswd.week_day_id = wd.id
        WHERE wd.id = :weekdayId
        """, nativeQuery = true)
    List<Attendance> findAllByWeekday( Integer weekdayId);


    @Query(value = """
        SELECT a.*
        FROM attendance a
        JOIN online_student_week_days oswd ON oswd.id = a.online_student_week_day_id
        WHERE  CAST(a.lesson_date AS BIGINT) BETWEEN :startTs AND :endTs
        ORDER BY a.date
        """, nativeQuery = true)
    List<Attendance> findAllByWeekdayAndLessonDateBetween(
            @Param("startTs") long startTs,
            @Param("endTs") long endTs
    );


    @Query(value = "select * from attendance where online_student_week_day_id=:id and hemis_id=:hemisId", nativeQuery = true)
    Optional<Attendance> findByHemisIdAndOnlineStudentWeekdayId(Integer hemisId, UUID id);

    @Transactional
    void deleteAllByOnlineStudentWeekDayId(UUID id);

}
