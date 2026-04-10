package com.example.backend.Controller;


import com.example.backend.DTO.MonthsDTO;
import com.example.backend.Entity.AmaliyotYuklamasi;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Months;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.AmaliyotYuklamasiRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.MonthsRepo;
import com.example.backend.Repository.StudentRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/months")
public class MonthsController {
    private final GroupsRepo groupsRepo;
    private final MonthsRepo monthsRepo;
    private final AmaliyotYuklamasiRepo amaliyotYuklamasiRepo;
    private final StudentRepo studentRepo;
    @GetMapping
    public ResponseEntity<?> getMonths(){
        List<Months> months = monthsRepo.findAll();
        return ResponseEntity.ok().body(months);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getMonthsByGroup(@PathVariable UUID groupId) {
        List<Months> monthsList = monthsRepo.findAllByGroups_Id(groupId);
        if (monthsList.isEmpty()) {
            return ResponseEntity.ok().body("Ushbu guruh uchun oylar topilmadi.");
        }
        return ResponseEntity.ok(monthsList);
    }


    @PostMapping
    public HttpEntity<?> createMonth(@RequestBody MonthsDTO dto) {
        try {
            String month = dto.getMonth();
            String description = dto.getDescription();

            // 🔹 deadline ni LocalDateTime formatga o‘tkazish
            LocalDateTime deadline = null;
            if (dto.getDeadline() != null && !dto.getDeadline().isEmpty()) {
                deadline = LocalDateTime.parse(dto.getDeadline());
            }

            // 🔹 Guruhni topish
            UUID groupId = dto.getGroupId();
            Groups group = groupsRepo.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Guruh topilmadi!"));

            // 🔹 Oy entity yaratish
            Months months = new Months();
            months.setMonths(month);
            months.setDescription(description);
            months.setDeadline(deadline);
            months.setCreatedAt(LocalDateTime.now());
            months.setGroups(group);

            Months savedMonth = monthsRepo.save(months);

            // 🔥 Oyning kundalik deadline-larini hisoblash
            LocalDateTime now = LocalDateTime.now();
            int year = now.getYear();

            // Oy nomidan raqam topamiz
            int monthNumber = switch (month.toLowerCase()) {
                case "yanvar" -> 1;
                case "fevral" -> 2;
                case "mart" -> 3;
                case "aprel" -> 4;
                case "may" -> 5;
                case "iyun" -> 6;
                case "iyul" -> 7;
                case "avgust" -> 8;
                case "sentyabr" -> 9;
                case "oktyabr" -> 10;
                case "noyabr" -> 11;
                case "dekabr" -> 12;
                default -> throw new RuntimeException("Noto‘g‘ri oy nomi: " + month);
            };

            // Oy oxiri kunini aniqlaymiz
            int lastDayOfMonth = java.time.Month.of(monthNumber).length(java.time.Year.isLeap(year));

            // Har bir kundalik uchun deadline-lar
            LocalDateTime end1 = LocalDateTime.of(year, monthNumber, 7, 23, 59);
            LocalDateTime end2 = LocalDateTime.of(year, monthNumber, 14, 23, 59);
            LocalDateTime end3 = LocalDateTime.of(year, monthNumber, 21, 23, 59);
            LocalDateTime end4 = LocalDateTime.of(year, monthNumber, lastDayOfMonth, 23, 59);

            // 🔹 Guruhdagi barcha talabalarga default AmaliyotYuklamasi yaratish
            List<Student> students = studentRepo.findAllByGroup_Id(group.getId());
            for (Student st : students) {
                AmaliyotYuklamasi ay = AmaliyotYuklamasi.builder()
                        .month(savedMonth)
                        .student(st)
                        .deadline(deadline)
                        .grade(0)

                        // barcha statuslar = 1 (yubormagan)
                        .kundalikStatus(1)
                        .kundalik1Status(1)
                        .kundalik2Status(1)
                        .kundalik3Status(1)
                        .darsTahliliStatus(1)
                        .darsIshlanmasiStatus(1)
                        .tarbiyaviyStatus(1)
                        .sinfRahbarStatus(1)
                        .pedagogikStatus(1)
                        .tadbirStatus(1)
                        .photoStatus(1)
                        .hisobotStatus(1)

                        // 🔹 4 ta haftalik kundalik deadline-lari
                        .kundalikEndTime(end1)
                        .kundalikEndTime1(end2)
                        .kundalikEndTime2(end3)
                        .kundalikEndTime3(end4)
                        .build();

                amaliyotYuklamasiRepo.save(ay);
            }

            return ResponseEntity.ok("Oy yaratildi va barcha talabalarga 4 ta kundalik muddati bilan yuklama qo‘yildi!");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Xatolik: " + e.getMessage());
        }
    }

    @PutMapping("/{monthsId}")
    public HttpEntity<?> updateMonth(@PathVariable UUID monthsId, @RequestBody MonthsDTO dto) {
        Optional<Months> optionalMonth = monthsRepo.findById(monthsId);
        if (optionalMonth.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Months existingMonth = optionalMonth.get();
        // 🔹 Agar deadline bo‘lsa, parse qilamiz
        LocalDateTime deadline = null;
        if (dto.getDeadline() != null && !dto.getDeadline().isEmpty()) {
            deadline = LocalDateTime.parse(dto.getDeadline());
        }
        // 🔹 Maydonlarni yangilash
        if (dto.getMonth() != null) existingMonth.setMonths(dto.getMonth());
        existingMonth.setDescription(dto.getDescription());
        existingMonth.setDeadline(deadline);
        // 🔹 Guruhni saqlab qolish (eski groupni yo‘qotmaslik uchun)
        if (dto.getGroupId() != null) {
            Groups group = groupsRepo.findById(dto.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Guruh topilmadi!"));
            existingMonth.setGroups(group);
        }
        Months updated = monthsRepo.save(existingMonth);
        return ResponseEntity.ok(updated);
    }
    @Transactional
    @DeleteMapping("/{monthId}")
    public HttpEntity<?> deleteMonth(@PathVariable UUID monthId) {

        Optional<Months> month = monthsRepo.findById(monthId);
        if (month.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 🔥 AVVAL CHILD O‘CHADI
        amaliyotYuklamasiRepo.deleteByMonthId(monthId);

        // 🔥 KEYIN PARENT
        monthsRepo.deleteById(monthId);

        return ResponseEntity.ok("Month deleted");
    }
}
