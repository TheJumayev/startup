package com.example.backend.Controller;

import com.example.backend.Entity.OnlineStudent;
import com.example.backend.Entity.OnlineStudentWeekDay;
import com.example.backend.Entity.WeekDays;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/online-student-weekday")
public class OnlineStudentWeekDayController {

    private final OnlineStudentRepo onlineStudentRepo;
    private final OnlineStudentWeekDayRepo onlineStudentWeekDayRepo;
    private final StudentRepo studentRepo;
    private final WeekDayRepo weekDayRepo;
    private final AttendanceRepo attendanceRepo;

    // -------------------- BASIC READS (existing style) --------------------

    // Active by weekday
    @GetMapping("/weekday/{weekdayId}")
    public HttpEntity<?> getActiveByWeekday(@PathVariable Integer weekdayId) {
        List<OnlineStudentWeekDay> result = onlineStudentWeekDayRepo.findAllByWeekdayIdAndActiveTrue(weekdayId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // All by weekday
    @GetMapping("/all/weekday/{weekdayId}")
    public HttpEntity<?> getAllByWeekday(@PathVariable Integer weekdayId) {
        List<OnlineStudentWeekDay> result = onlineStudentWeekDayRepo.findAllByWeekdayId(weekdayId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Active by group
    @GetMapping("/group/{groupId}")
    public HttpEntity<?> getActiveByGroup(@PathVariable UUID groupId) {
        List<OnlineStudentWeekDay> result = onlineStudentWeekDayRepo.findAllByGroupIdAndActiveTrue(groupId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // All by group
    @GetMapping("/all/group/{groupId}")
    public HttpEntity<?> getAllByGroup(@PathVariable UUID groupId) {
        List<OnlineStudentWeekDay> result = onlineStudentWeekDayRepo.findAllByGroupId(groupId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Active all
    @GetMapping
    public HttpEntity<?> getAllActive() {
        return new ResponseEntity<>(onlineStudentWeekDayRepo.findAllByActiveTrue(), HttpStatus.OK);
    }

    // All
    @GetMapping("/all")
    public HttpEntity<?> getAll() {
        return new ResponseEntity<>(onlineStudentWeekDayRepo.findAll(), HttpStatus.OK);
    }

    // Active by group + weekday
    @GetMapping("/{groupId}/{weekdayId}")
    public HttpEntity<?> getActiveByGroupAndWeekday(@PathVariable UUID groupId,
                                                    @PathVariable Integer weekdayId) {
        List<OnlineStudentWeekDay> result =
                onlineStudentWeekDayRepo.findAllByWeekdayIdAndGroupIdAndActiveTrue(weekdayId, groupId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // All by group + weekday
    @GetMapping("/all/{groupId}/{weekdayId}")
    public HttpEntity<?> getAllByGroupAndWeekday(@PathVariable UUID groupId,
                                                 @PathVariable Integer weekdayId) {
        List<OnlineStudentWeekDay> result =
                onlineStudentWeekDayRepo.findAllByWeekdayIdAndGroupId(weekdayId, groupId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // -------------------- WEEKDAYS CATALOG --------------------

    // List all weekdays (to build UI)
    @GetMapping("/weekdays")
    public HttpEntity<?> getWeekdays() {
        return new ResponseEntity<>(weekDayRepo.findAll(), HttpStatus.OK);
    }

    // -------------------- STUDENT-CENTRIC ENDPOINTS --------------------

    // Get a student's weekdays (activeOnly=true default)
    @GetMapping("/student/{studentId}")
    public HttpEntity<?> getByStudent(
            @PathVariable UUID studentId,
            @RequestParam(value = "activeOnly", defaultValue = "true") boolean activeOnly
    ) {
        List<OnlineStudentWeekDay> result = activeOnly
                ? onlineStudentWeekDayRepo.findAllByOnlineStudentStudentIdAndActiveTrue(studentId)
                : onlineStudentWeekDayRepo.findAllByOnlineStudentStudentId(studentId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    // Assign weekday for student (idempotent: if exists -> set active=true)
    @PostMapping("/by-student")
    public HttpEntity<?> createForStudent(
            @RequestParam UUID studentId,
            @RequestParam Integer weekdayId
    ) {
        // Make sure the OnlineStudent row exists for this student
        Optional<OnlineStudent> onlineStudentOpt = onlineStudentRepo.findByStudentId(studentId);
        if (onlineStudentOpt.isEmpty()) {
            return new ResponseEntity<>("OnlineStudent not found for studentId", HttpStatus.NOT_FOUND);
        }

        Optional<WeekDays> weekdayOpt = weekDayRepo.findById(weekdayId);
        if (weekdayOpt.isEmpty()) {
            return new ResponseEntity<>("WeekDay not found", HttpStatus.NOT_FOUND);
        }

        // If already exists -> reactivate
        Optional<OnlineStudentWeekDay> existing =
                onlineStudentWeekDayRepo.findByOnlineStudentStudentIdAndWeekdayId(studentId, weekdayId);

        if (existing.isPresent()) {
            OnlineStudentWeekDay rec = existing.get();
            rec.setActive(true);
            rec.setUpdatedAt(LocalDateTime.now());
            return new ResponseEntity<>(onlineStudentWeekDayRepo.save(rec), HttpStatus.OK);
        }

        OnlineStudentWeekDay rec = OnlineStudentWeekDay.builder()
                .onlineStudent(onlineStudentOpt.get())
                .weekday(weekdayOpt.get())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(onlineStudentWeekDayRepo.save(rec), HttpStatus.CREATED);
    }

    // Update a student's weekday record (switch weekday)
    @PutMapping("/by-student/{id}")
    public HttpEntity<?> updateForStudent(
            @PathVariable UUID id,
            @RequestParam Integer weekdayId
    ) {
        Optional<OnlineStudentWeekDay> opt = onlineStudentWeekDayRepo.findById(id);
        if (opt.isEmpty()) return new ResponseEntity<>("Record not found", HttpStatus.NOT_FOUND);

        Optional<WeekDays> weekdayOpt = weekDayRepo.findById(weekdayId);
        if (weekdayOpt.isEmpty()) return new ResponseEntity<>("WeekDay not found", HttpStatus.NOT_FOUND);

        OnlineStudentWeekDay rec = opt.get();
        rec.setWeekday(weekdayOpt.get());
        rec.setUpdatedAt(LocalDateTime.now());
        return new ResponseEntity<>(onlineStudentWeekDayRepo.save(rec), HttpStatus.OK);
    }

    // Toggle active (true<->false)
    @PutMapping("/active/{id}")
    public HttpEntity<?> changeStatus(@PathVariable UUID id) {
        Optional<OnlineStudentWeekDay> optional = onlineStudentWeekDayRepo.findById(id);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Record not found", HttpStatus.NOT_FOUND);
        }

        OnlineStudentWeekDay record = optional.get();
        record.setActive(Boolean.FALSE.equals(record.getActive()));
        record.setUpdatedAt(LocalDateTime.now());
        return new ResponseEntity<>(onlineStudentWeekDayRepo.save(record), HttpStatus.OK);
    }

    @DeleteMapping("/by-student/{id}")
    @Transactional
    public HttpEntity<?> deleteForStudent(@PathVariable UUID id) {
        if (!onlineStudentWeekDayRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Record not found");
        }
        // 1️⃣ Avval attendance yozuvlarini o‘chiramiz
        attendanceRepo.deleteAllByOnlineStudentWeekDayId(id);
        // 2️⃣ So‘ng asosiy yozuvni o‘chiramiz
        onlineStudentWeekDayRepo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }


    // Delete by (studentId + weekdayId)
    @DeleteMapping("/by-student")
    @Transactional
    public HttpEntity<?> deleteForStudentByWeekday(
            @RequestParam UUID studentId,
            @RequestParam Integer weekdayId
    ) {
        Optional<OnlineStudentWeekDay> opt =
                onlineStudentWeekDayRepo.findByOnlineStudentStudentIdAndWeekdayId(studentId, weekdayId);

        if (opt.isEmpty()) return new ResponseEntity<>("Record not found", HttpStatus.NOT_FOUND);

        UUID recordId = opt.get().getId();

        // Avval attendance ni o‘chiramiz
        attendanceRepo.deleteAllByOnlineStudentWeekDayId(recordId);

        // So‘ng asosiy yozuvni o‘chiramiz
        onlineStudentWeekDayRepo.deleteById(recordId);

        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }


    // -------------------- LEGACY CREATE/UPDATE/DELETE (optional) --------------------

    @PostMapping
    public HttpEntity<?> createOnlineStudentWeekDay(@RequestParam UUID onlineStudentId,
                                                    @RequestParam Integer weekdayId) {
        Optional<OnlineStudent> optStudent = onlineStudentRepo.findById(onlineStudentId);
        Optional<WeekDays> optWeek = weekDayRepo.findById(weekdayId);

        if (optStudent.isEmpty() || optWeek.isEmpty()) {
            return new ResponseEntity<>("OnlineStudent yoki WeekDay topilmadi", HttpStatus.NOT_FOUND);
        }

        OnlineStudentWeekDay rec = OnlineStudentWeekDay.builder()
                .onlineStudent(optStudent.get())
                .weekday(optWeek.get())
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        return new ResponseEntity<>(onlineStudentWeekDayRepo.save(rec), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> updateOnlineStudentWeekDay(@PathVariable UUID id,
                                                    @RequestParam UUID onlineStudentId,
                                                    @RequestParam Integer weekdayId) {
        Optional<OnlineStudentWeekDay> optional = onlineStudentWeekDayRepo.findById(id);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Record not found", HttpStatus.NOT_FOUND);
        }

        Optional<OnlineStudent> optStudent = onlineStudentRepo.findById(onlineStudentId);
        Optional<WeekDays> optWeek = weekDayRepo.findById(weekdayId);

        if (optStudent.isEmpty() || optWeek.isEmpty()) {
            return new ResponseEntity<>("OnlineStudent yoki WeekDay topilmadi", HttpStatus.NOT_FOUND);
        }

        OnlineStudentWeekDay record = optional.get();
        record.setOnlineStudent(optStudent.get());
        record.setWeekday(optWeek.get());
        record.setUpdatedAt(LocalDateTime.now());

        return new ResponseEntity<>(onlineStudentWeekDayRepo.save(record), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteOnlineStudentWeekDay(@PathVariable UUID id) {
        if (!onlineStudentWeekDayRepo.existsById(id)) {
            return new ResponseEntity<>("Record not found", HttpStatus.NOT_FOUND);
        }
        onlineStudentWeekDayRepo.deleteById(id);
        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }
}
