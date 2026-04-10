package com.example.backend.Repository;

import com.example.backend.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepo extends JpaRepository<Student, UUID> {

    @Query(value = "SELECT * FROM students WHERE passport_pin = :passportPin", nativeQuery = true)
    Optional<Student> findByPassport_pin(@Param("passportPin") String passport_pin);

    @Query(value = "SELECT * FROM students WHERE group_name = :groupName", nativeQuery = true)
    List<Student> findAllByGroup(@Param("groupName") String groupName);

    @Query(value = "select * from students where hemis_id=:hemisId", nativeQuery = true)
    Optional<Student> findByHemisId(Integer hemisId);


    @Query(value = "select * from students where student_id_number=:id_number", nativeQuery = true)
    Optional<Student> findByStudentIdNumberContract(String id_number);


    @Query(value = "select * from students where group_id=:groupId", nativeQuery = true)
    List<Student> findAllByGroupId(UUID groupId);


    Optional<Student> findByStudentIdNumber(String studentIdNumber);


    @Query(value = "select * from students where level='1-kurs'", nativeQuery = true)
    List<Student> findAllByGroupLevel();





    int countByGroupId(UUID groupId);


    @Query(value = "select * from students where not is_online or is_online=null and group_id=:groupId", nativeQuery = true)
    List<Student> findAllIsNotOnlineAndGroupId(UUID groupId);

    List<Student> findAllByGroup_Id(UUID groupId);

    @Query(value = "select * from students where group_id=:groupId and is_online", nativeQuery = true)
    List<Student> findAllByGroupIdAndIsOnline(UUID groupId);

    List<Student> findByGroupId(UUID groupId);
}
