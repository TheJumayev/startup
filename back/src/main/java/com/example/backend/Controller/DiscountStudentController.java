package com.example.backend.Controller;

import com.example.backend.DTO.DiscountByYearDTO;
import com.example.backend.DTO.DiscountStudentDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.DiscountByYear;
import com.example.backend.Entity.DiscountStudent;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.DiscountByYearRepo;
import com.example.backend.Repository.DiscountStudentRepo;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/discount-student")
public class DiscountStudentController {
    private final DiscountStudentRepo discountStudentRepo;
    private final DiscountByYearRepo discountByYearRepo;
    private final AttachmentRepo attachmentRepo;
    private final StudentRepo studentRepo;

    @GetMapping
    public HttpEntity<?> getAllStudents() {
        List<DiscountStudent> all = discountStudentRepo.findAllByDay();
        return ResponseEntity.ok(all);
    }

    @PutMapping("/discountYear/{yearId}/{fileId}")
    public HttpEntity<?> getAllStudentsByYear(@PathVariable UUID fileId, @PathVariable Integer yearId) {
        Optional<Attachment> attachment = attachmentRepo.findById(fileId);
        if (attachment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<DiscountByYear> year = discountByYearRepo.findById(yearId);
        if (year.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Attachment attachment1 = attachment.get();
        DiscountByYear discountByYear = year.get();
        discountByYear.setAttachment(attachment1);
        DiscountByYear save = discountByYearRepo.save(discountByYear);
        return ResponseEntity.ok(save);
    }

    @GetMapping("/{studentPassportId}")
    public HttpEntity<?> getStudent(@PathVariable String studentPassportId) {
        Optional<DiscountStudent> all = discountStudentRepo.findByPassportPin(studentPassportId);
        if (all.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(all);
    }

    @PostMapping
    public HttpEntity<?> createDiscountStudent(@RequestBody DiscountStudentDTO request) {
        List<DiscountByYear> savedYears = new ArrayList<>();

        if (request.getDiscountByYear() != null) {
            for (DiscountByYearDTO dto : request.getDiscountByYear()) {
                DiscountByYear year = DiscountByYear.builder()
                        .name(dto.getName())
                        .discount(dto.getDiscount())
                        .createAt(LocalDateTime.now())
                        .build();
                savedYears.add(discountByYearRepo.save(year));
            }
        }

        DiscountStudent student = DiscountStudent.builder()
                .name(request.getName())
                .passport_pin(request.getPassport_pin())
                .hemis_login(request.getHemis_login())
                .groupName(request.getGroup())
                .asos(request.getAsos())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .status(1)
                .discountByYear(savedYears)
                .build();

        return ResponseEntity.ok(discountStudentRepo.save(student));
    }

    @DeleteMapping("/{studentId}")
    public HttpEntity<?> deleteDiscountStudent(@PathVariable("studentId") Integer studentId) {
        discountByYearRepo.deleteByStudentId(studentId);
        discountStudentRepo.deleteById(studentId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{studentId}")
    public HttpEntity<?> updateDiscountStudent(@PathVariable("studentId") Integer studentId, @RequestBody DiscountStudentDTO request) {
        List<DiscountByYear> savedYears = new ArrayList<>();
        Optional<DiscountStudent> byId = discountStudentRepo.findById(studentId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        DiscountStudent discount = byId.get();
        discount.setName(request.getName());
        discount.setPassport_pin(request.getPassport_pin());
        discount.setHemis_login(request.getHemis_login());
        discount.setGroupName(request.getGroup());

        if (request.getAsos() != null) {
            discount.setAsos(request.getAsos());
        }

        discount.setDescription(request.getDescription());

        if (request.getDiscountByYear() != null) {
            discountByYearRepo.deleteByStudentId(studentId);
            for (DiscountByYearDTO dto : request.getDiscountByYear()) {
                DiscountByYear year = new DiscountByYear();
                year.setName(dto.getName());
                year.setDiscount(dto.getDiscount());
                year.setCreateAt(LocalDateTime.now());
                year.setStudent(discount);   // ✅ endi ishlaydi
                savedYears.add(discountByYearRepo.save(year));

            }
            discount.setDiscountByYear(savedYears); // 🔑 studentga qayta biriktirish
        }

        DiscountStudent save = discountStudentRepo.save(discount);
        return ResponseEntity.ok(save);
    }

    @PutMapping("/{discountStudentId}/{fileId}")
    public HttpEntity<?> changeDiscountStudent(@PathVariable("discountStudentId") Integer discountStudentId, @PathVariable UUID fileId){
        Optional<DiscountStudent> byId = discountStudentRepo.findById(discountStudentId);
        if(byId.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        DiscountStudent discountStudent = byId.get();
        Optional<Attachment> byId1 = attachmentRepo.findById(fileId);
        if(byId1.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Attachment attachment = byId1.get();
        discountStudent.setFile(attachment);
        DiscountStudent save = discountStudentRepo.save(discountStudent);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }




    @GetMapping("/update")
    public HttpEntity<?> updateDiscountStudent() {
//         String filePath = System.getProperty("user.home") + "/Desktop/talaba1.xlsx";
//            String filePath = "C:/Users/user/Desktop/talaba1.xlsx";

            String filePath = "./talaba1.xlsx";
        try {
            FileInputStream fis = new FileInputStream(new File(filePath));
            Workbook workbook = new XSSFWorkbook(fis);
            Sheet sheet = workbook.getSheetAt(0);

            Iterator<Row> rowIterator = sheet.iterator();
            rowIterator.next(); // skip header row

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                String name = getString(row.getCell(1));          // Talaba
                String passportPin = getString(row.getCell(2));  // JSHSHIR
                String hemisLogin = getString(row.getCell(3));   // hemis_login
                String group = getString(row.getCell(4));        // Guruh
                String asos = getString(row.getCell(14));        // Asos
                String description = getString(row.getCell(15)); // Description

                // Collect DiscountByYear list
                List<DiscountByYear> discountByYears = new ArrayList<>();
                int totalDiscount = 0;
                for (int i = 6; i <= 13; i++) { // G → N columns
                    Cell cell = row.getCell(i);
                    if (cell != null && cell.getCellType() == CellType.NUMERIC) {
                        int amount = (int) cell.getNumericCellValue();
                        String yearName = sheet.getRow(0).getCell(i).getStringCellValue();

                        DiscountByYear discountByYear = DiscountByYear.builder()
                                .name(yearName)
                                .discount(amount)
                                .createAt(LocalDateTime.now())
                                .build();
                        try{
                        discountByYearRepo.save(discountByYear);
                        }catch (Exception e){
                            System.out.println(e.getMessage());
                        }
                        discountByYears.add(discountByYear);
                        totalDiscount += amount;
                    }
                }

                // Save DiscountStudent
                DiscountStudent student = DiscountStudent.builder()
                        .name(name)
                        .passport_pin(passportPin)
                        .hemis_login(hemisLogin)
                        .groupName(group)
                        .discountByYear(discountByYears)
                        .createdAt(LocalDateTime.now())
                        .status(1)
                        .asos(asos)
                        .description(description)
                        .build();

                try{
                    discountStudentRepo.save(student);
                }catch (Exception e){
                    System.out.println(e.getMessage());
                }

                System.out.println("Saved student: " + name + " | Total discount: " + totalDiscount);
            }

            workbook.close();
            fis.close();

            return ResponseEntity.ok("Excel imported successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error importing Excel: " + e.getMessage());
        }
    }

    private String getString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf((long) cell.getNumericCellValue());
        return null;
    }


    @PutMapping("/{studentId}/add-discount")
    public HttpEntity<?> addDiscountToStudent(
            @PathVariable Integer studentId,
            @RequestBody Map<String, Object> request) {
        try {
            Optional<DiscountStudent> optionalStudent = discountStudentRepo.findById(studentId);
            if (optionalStudent.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            DiscountStudent student = optionalStudent.get();

            DiscountByYear discountByYear = DiscountByYear.builder()
                    .name((String) request.get("name"))
                    .discount((Integer) request.get("discount"))
                    .createAt(LocalDateTime.now())
                    .build();

            discountByYearRepo.save(discountByYear);

            List<DiscountByYear> discounts = student.getDiscountByYear();
            if (discounts == null) {
                discounts = new ArrayList<>();
            }
            discounts.add(discountByYear);

            student.setDiscountByYear(discounts);
            discountStudentRepo.save(student);

            return ResponseEntity.ok(student);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    @DeleteMapping("/{studentId}/discount/{discountId}")
    public HttpEntity<?> removeDiscountFromStudent(
            @PathVariable Integer studentId,
            @PathVariable Integer discountId) {
        try {
            Optional<DiscountStudent> optionalStudent = discountStudentRepo.findById(studentId);
            if (optionalStudent.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            DiscountStudent student = optionalStudent.get();

            List<DiscountByYear> discounts = student.getDiscountByYear();
            if (discounts != null) {
                discounts.removeIf(d -> d.getId().equals(discountId));
            }
            student.setDiscountByYear(discounts);
            discountStudentRepo.save(student);

            // also delete DiscountByYear from repo
            discountByYearRepo.deleteById(discountId);

            return ResponseEntity.ok(student);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


}
