package com.example.backend.Repository;

import com.example.backend.Entity.ScheduleList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ScheduleListRepo extends JpaRepository<ScheduleList, UUID> {


    @Query(value = """
    SELECT DISTINCT sl.*
    FROM schedule_list sl
    JOIN attendance_offline ao ON ao.schedule_list_id = sl.id
    WHERE ao.today_online = true
      AND sl.lesson_date = :lessonDate
""", nativeQuery = true)
    List<ScheduleList> findScheduleListsWithTodayOnlineStudents(
            @Param("lessonDate") String lessonDate
    );


    boolean existsByHemisId(Integer hemisId);

    @Query(value = """
        select * from schedule_list 
        where group_id = :groupId 
          and lesson_date = :lessonDate
        order by start_time
        """, nativeQuery = true)
    List<ScheduleList> findByGroupsIdAndLessonDate(
            UUID groupId,
            String lessonDate
    );

    @Query(value = """
    SELECT DISTINCT sl.*
    FROM schedule_list sl
    JOIN attendance_offline ao ON ao.schedule_list_id = sl.id
    JOIN students s ON ao.student_id = s.id
    WHERE s.is_online = true
      AND sl.lesson_date = :lessonDate
""", nativeQuery = true)
    List<ScheduleList> findScheduleListsWithOnlineStudents(@Param("lessonDate") String lessonDate);


    @Query(value = "select * from schedule_list where  lesson_date = :todayTimestamp order by start_time ", nativeQuery = true)
    List<ScheduleList> findSekretarByLessonDate(String todayTimestamp);


    @Query("""
    SELECT s
    FROM ScheduleList s
    WHERE s.lessonDate = :lessonDate
    ORDER BY s.start_time ASC
""")
    List<ScheduleList> findAllByLessonDate(@Param("lessonDate") String lessonDate);

    @Query(value = """
        select * from schedule_list 
        where group_id = :groupId 
        order by start_time
        """, nativeQuery = true)
    List<ScheduleList> byGroupId(UUID groupId);

    @Query("""
        SELECT s
        FROM ScheduleList s
        WHERE s.groups.id = :groupId
        AND s.lessonDate BETWEEN :fromTs AND :toTs
        ORDER BY s.lessonDate ASC
    """)
    List<ScheduleList> findByGroupAndDateRange(
            @Param("groupId") UUID groupId,
            @Param("fromTs") String fromTs,
            @Param("toTs") String toTs
    );}
