package com.example.backend.Controller;

import com.example.backend.DTO.AmaliyotYuklamasiDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.util.*;
import java.util.function.BiConsumer;


@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/amaliyot-yuklama")
public class AmaliyotYuklamasiController {

    private final AmaliyotYuklamasiRepo amaliyotYuklamasiRepo;
    private final StudentRepo studentRepo;
    private final AttachmentRepo attachmentRepo;
    private final MonthsRepo monthsRepo;

    @GetMapping("/all")
    public ResponseEntity<?> getAll(){
        List<AmaliyotYuklamasi> all = amaliyotYuklamasiRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getByStudentId(@PathVariable UUID studentId) {
        List<AmaliyotYuklamasi> list = amaliyotYuklamasiRepo.findAllByStudentId(studentId);
        if(list.isEmpty()){
            return ResponseEntity.status(404)
                    .body("❌ Ushbu talaba uchun amaliyot yuklamasi topilmadi");
        }

        return ResponseEntity.ok(list);
    }



    @PutMapping("/{amaliyotId}/{grade}")
    public ResponseEntity<?> grade(@PathVariable UUID amaliyotId, @PathVariable Integer grade) {
        Optional<AmaliyotYuklamasi> amaliyot = amaliyotYuklamasiRepo.findById(amaliyotId);
        if (amaliyot.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        amaliyot.get().setGrade(grade);
        AmaliyotYuklamasi save = amaliyotYuklamasiRepo.save(amaliyot.get());
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    @GetMapping("/{studentId}/{monthId}")
    public ResponseEntity<?> getOneAmaliyotYuklamasi(
            @PathVariable UUID studentId,
            @PathVariable UUID monthId
    ) {
        Optional<AmaliyotYuklamasi> yuklamaOpt = amaliyotYuklamasiRepo.findByStudentIdAndMonthId(studentId, monthId);
        System.out.println("🔹 Keldi: studentId=" + studentId + " | monthId=" + monthId);

        if (yuklamaOpt.isEmpty()) {
            System.out.println("❌ Yuklama topilmadi");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Ushbu student va oy uchun amaliyot yuklamasi topilmadi");
        }

        AmaliyotYuklamasi found = yuklamaOpt.get();
        System.out.println("✅ Yuklama topildi: " + found.getId());

        return ResponseEntity.ok(found);
    }


    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestBody AmaliyotYuklamasiDTO dto) {
        try {
            // 1️⃣ Oy va talabani tekshirish
            Months month = monthsRepo.findById(dto.getMonthId())
                    .orElseThrow(() -> new RuntimeException("❌ Oy (Month) topilmadi!"));
            Student student = studentRepo.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("❌ Student topilmadi!"));

            // 2️⃣ Mavjud yuklama bo‘lsa olish yoki yangisini yaratish
            AmaliyotYuklamasi yuklama = amaliyotYuklamasiRepo.findByStudentIdAndMonthId(student.getId(), month.getId())
                    .orElseGet(() -> {
                        AmaliyotYuklamasi y = new AmaliyotYuklamasi();
                        y.setMonth(month);
                        y.setStudent(student);
                        y.setDeadline(month.getDeadline());
                        return y;
                    });

            // 3️⃣ Qaysi fayl yuborilganini xavfsiz aniqlash
            Map<String, UUID> fieldMap = new LinkedHashMap<>();
            if (dto.getKundalik() != null) fieldMap.put("kundalik", dto.getKundalik());
            if (dto.getKundalik1() != null) fieldMap.put("kundalik1", dto.getKundalik1());
            if (dto.getKundalik2() != null) fieldMap.put("kundalik2", dto.getKundalik2());
            if (dto.getKundalik3() != null) fieldMap.put("kundalik3", dto.getKundalik3());
            if (dto.getDarsTahlili() != null) fieldMap.put("darsTahlili", dto.getDarsTahlili());
            if (dto.getDarsIshlanmasi() != null) fieldMap.put("darsIshlanmasi", dto.getDarsIshlanmasi());
            if (dto.getTarbiyaviy() != null) fieldMap.put("tarbiyaviy", dto.getTarbiyaviy());
            if (dto.getSinfRahbar() != null) fieldMap.put("sinfRahbar", dto.getSinfRahbar());
            if (dto.getPedagogik() != null) fieldMap.put("pedagogik", dto.getPedagogik());
            if (dto.getTadbir() != null) fieldMap.put("tadbir", dto.getTadbir());
            if (dto.getPhoto() != null) fieldMap.put("photo", dto.getPhoto());
            if (dto.getHisobot() != null) fieldMap.put("hisobot", dto.getHisobot());

            if (fieldMap.isEmpty()) {
                return ResponseEntity.badRequest().body("❗ Hech qanday fayl ID kelmadi!");
            }

            String fieldName = fieldMap.keySet().iterator().next();
            UUID fileId = fieldMap.get(fieldName);

            Attachment file = attachmentRepo.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("❌ Fayl topilmadi!"));

            LocalDateTime now = LocalDateTime.now();

            // 4️⃣ Statusni avtomatik aniqlash (har safar 2 — “yangi yuklangan”)
            int statusValue = 2;

            // 5️⃣ Faylni joylashtirish
            switch (fieldName) {
                case "kundalik" -> {
                    yuklama.setKundalikFile(file);
                    yuklama.setKundalikStatus(statusValue);
                    yuklama.setKundalikUpdate(now);
                }
                case "kundalik1" -> {
                    yuklama.setKundalik1File(file);
                    yuklama.setKundalik1Status(statusValue);
                    yuklama.setKundalik1Update(now);
                }
                case "kundalik2" -> {
                    yuklama.setKundalik2File(file);
                    yuklama.setKundalik2Status(statusValue);
                    yuklama.setKundalik2Update(now);
                }
                case "kundalik3" -> {
                    yuklama.setKundalik3File(file);
                    yuklama.setKundalik3Status(statusValue);
                    yuklama.setKundalik3Update(now);
                }
                case "darsTahlili" -> {
                    yuklama.setDarsTahliliFile(file);
                    yuklama.setDarsTahliliStatus(statusValue);
                    yuklama.setDarsTahliliUpdate(now);
                }
                case "darsIshlanmasi" -> {
                    yuklama.setDarsIshlanmasiFile(file);
                    yuklama.setDarsIshlanmasiStatus(statusValue);
                    yuklama.setDarsIshlanmasiUpdate(now);
                }
                case "tarbiyaviy" -> {
                    yuklama.setTarbiyaviyFile(file);
                    yuklama.setTarbiyaviyStatus(statusValue);
                    yuklama.setTarbiyaviyUpdate(now);
                }
                case "sinfRahbar" -> {
                    yuklama.setSinfRahbarFile(file);
                    yuklama.setSinfRahbarStatus(statusValue);
                    yuklama.setSinfRahbarUpdate(now);
                }
                case "pedagogik" -> {
                    yuklama.setPedagogikFile(file);
                    yuklama.setPedagogikStatus(statusValue);
                    yuklama.setPedagogikUpdate(now);
                }
                case "tadbir" -> {
                    yuklama.setTadbirFile(file);
                    yuklama.setTadbirStatus(statusValue);
                    yuklama.setTadbirUpdate(now);
                }
                case "photo" -> {
                    yuklama.setPhotoFile(file);
                    yuklama.setPhotoStatus(statusValue);
                    yuklama.setPhotoUpdate(now);
                }
                case "hisobot" -> {
                    yuklama.setHisobotFile(file);
                    yuklama.setHisobotStatus(statusValue);
                    yuklama.setHisobotUpdate(now);
                }
            }

            // 6️⃣ Kundalik segment sanalarini avtomatik to‘ldirish (faqat yangi yozuv uchun)
            if (yuklama.getKundalikEndTime() == null) {
                int currentYear = LocalDate.now().getYear();
                String monthName = month.getMonths().trim().toLowerCase(Locale.ROOT);

                Month selectedMonth = switch (monthName) {
                    case "yanvar" -> Month.JANUARY;
                    case "fevral" -> Month.FEBRUARY;
                    case "mart" -> Month.MARCH;
                    case "aprel" -> Month.APRIL;
                    case "may" -> Month.MAY;
                    case "iyun" -> Month.JUNE;
                    case "iyul" -> Month.JULY;
                    case "avgust" -> Month.AUGUST;
                    case "sentabr" -> Month.SEPTEMBER;
                    case "oktabr" -> Month.OCTOBER;
                    case "noyabr" -> Month.NOVEMBER;
                    case "dekabr" -> Month.DECEMBER;
                    default -> throw new RuntimeException("❌ Noto‘g‘ri oy nomi: " + monthName);
                };

                int daysInMonth = selectedMonth.length(Year.isLeap(currentYear));
                yuklama.setKundalikEndTime(LocalDate.of(currentYear, selectedMonth, Math.min(1, daysInMonth)).atStartOfDay());
                yuklama.setKundalikEndTime1(LocalDate.of(currentYear, selectedMonth, Math.min(8, daysInMonth)).atStartOfDay());
                yuklama.setKundalikEndTime2(LocalDate.of(currentYear, selectedMonth, Math.min(15, daysInMonth)).atStartOfDay());
                yuklama.setKundalikEndTime3(LocalDate.of(currentYear, selectedMonth, Math.min(21, daysInMonth)).atStartOfDay());
            }

            // 7️⃣ Saqlash
            AmaliyotYuklamasi saved = amaliyotYuklamasiRepo.save(yuklama);
            System.out.println("✅ Saqlandi: " + saved.getId() + " | Field: " + fieldName);

            // 8️⃣ Javob
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("data", saved);
            resp.put("field", fieldName);
            resp.put("status", statusValue);
            resp.put("student", student.getFullName());
            resp.put("message", "✅ Fayl muvaffaqiyatli yuklandi: " + fieldName);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Yuklashda xatolik: " + e.getMessage());
        }
    }

    @PutMapping("/{amaliyotId}")
    public ResponseEntity<?> editFile(@RequestBody AmaliyotYuklamasiDTO dto, @PathVariable UUID amaliyotId) {
        Optional<AmaliyotYuklamasi> optional = amaliyotYuklamasiRepo.findById(amaliyotId);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Amaliyot yuklamasi topilmadi!");
        }

        AmaliyotYuklamasi entity = optional.get();

        // 🔹 Faylni yangilash mantiği
        BiConsumer<String, UUID> handleFileUpdate = (field, fileId) -> {
            try {
                Field currentF = AmaliyotYuklamasi.class.getDeclaredField(field + "File");
                Field oldF = AmaliyotYuklamasi.class.getDeclaredField(field + "FileOld");
                currentF.setAccessible(true);
                oldF.setAccessible(true);

                // Joriy fayl
                Attachment currentFile = (Attachment) currentF.get(entity);

                if (fileId != null) {
                    // ✅ Agar yangi fileId kelsa — yangi faylni o‘rnatamiz
                    Attachment newFile = attachmentRepo.findById(fileId).orElse(null);
                    if (newFile != null) {
                        if (currentFile != null && !currentFile.getId().equals(newFile.getId())) {
                            oldF.set(entity, currentFile); // eski faylni old'ga o‘tkazamiz
                        }
                        currentF.set(entity, newFile);
                        System.out.println("✅ " + field + " fayli yangilandi: " + newFile.getName());
                    }
                } else if (currentFile == null) {
                    // ⚠️ Agar yangi fileId kelmagan, ammo fayl yo‘q — eski faylni qayta tiklash
                    Attachment oldFile = (Attachment) oldF.get(entity);
                    if (oldFile != null) {
                        currentF.set(entity, oldFile);
                        System.out.println("♻️ " + field + " fayli qayta tiklandi (eski fayldan).");
                    }
                }

            } catch (Exception e) {
                System.err.println("⚠️ Faylni yangilashda xatolik (" + field + "): " + e.getMessage());
            }
        };

        // 🔹 Statusni yangilash mantiği
        BiConsumer<String, Integer> handleStatusUpdate = (field, status) -> {
            try {
                if (status != null) {
                    Field statusF = AmaliyotYuklamasi.class.getDeclaredField(field + "Status");
                    Field descF = AmaliyotYuklamasi.class.getDeclaredField(field + "Description");
                    Field updateF = AmaliyotYuklamasi.class.getDeclaredField(field + "Update");
                    statusF.setAccessible(true);
                    descF.setAccessible(true);
                    updateF.setAccessible(true);

                    statusF.set(entity, status);
                    descF.set(entity, getFieldValue(dto, field + "Description"));
                    updateF.set(entity, LocalDateTime.now());

                    // ❌ Agar status 4 (rad etilgan) bo‘lsa — joriy faylni null qilib, eski faylni saqlaymiz
                    if (status == 4) {
                        Field currentFile = AmaliyotYuklamasi.class.getDeclaredField(field + "File");
                        Field oldFile = AmaliyotYuklamasi.class.getDeclaredField(field + "FileOld");
                        currentFile.setAccessible(true);
                        oldFile.setAccessible(true);

                        Attachment current = (Attachment) currentFile.get(entity);
                        if (current != null) {
                            oldFile.set(entity, current);
                            currentFile.set(entity, null);
                            System.out.println("❌ " + field + " fayl rad etildi va eski fayl saqlandi.");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Status yangilashda xatolik: " + e.getMessage());
            }
        };

        // 🔹 Barcha fieldlar bo‘yicha aylanish
        Map<String, Integer> fields = new LinkedHashMap<>();
        fields.put("kundalik", dto.getKundalikStatus());
        fields.put("kundalik1", dto.getKundalik1Status());
        fields.put("kundalik2", dto.getKundalik2Status());
        fields.put("kundalik3", dto.getKundalik3Status());
        fields.put("darsTahlili", dto.getDarsTahliliStatus());
        fields.put("darsIshlanmasi", dto.getDarsIshlanmasiStatus());
        fields.put("tarbiyaviy", dto.getTarbiyaviyStatus());
        fields.put("sinfRahbar", dto.getSinfRahbarStatus());
        fields.put("pedagogik", dto.getPedagogikStatus());
        fields.put("tadbir", dto.getTadbirStatus());
        fields.put("photo", dto.getPhotoStatus());
        fields.put("hisobot", dto.getHisobotStatus());

        fields.forEach((field, status) -> {
            UUID fileId = (UUID) Optional.ofNullable(getFieldValue(dto, field + "File"))
                    .orElse(getFieldValue(dto, field)); // ✅ ikki variantni qo‘llab-quvvatlaydi
            handleFileUpdate.accept(field, fileId);
            handleStatusUpdate.accept(field, status);
        });

        AmaliyotYuklamasi save = amaliyotYuklamasiRepo.save(entity);
        return ResponseEntity.ok(save);
    }

    /**
     * 🔧 Reflection yordamchi metod
     */
    private Object getFieldValue(Object obj, String fieldName) {
        try {
            Field f = obj.getClass().getDeclaredField(fieldName);
            f.setAccessible(true);
            return f.get(obj);
        } catch (Exception e) {
            return null;
        }
    }
}
