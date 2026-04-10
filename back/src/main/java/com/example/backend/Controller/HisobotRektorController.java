package com.example.backend.Controller;

import com.example.backend.Entity.Contract;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.ContractRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Services.StudentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.itextpdf.text.pdf.PdfName.F;



    @RestController
    @RequestMapping("/api/v1/hisobot-rektor")
    @RequiredArgsConstructor
    @CrossOrigin
    public class HisobotRektorController {

        private final StudentReportService reportService;
        /* ================= EXCEL ================= */
        @GetMapping("/excel/{groupId}")
        public ResponseEntity<byte[]> downloadExcel(@PathVariable UUID groupId) {

            byte[] file = reportService.generateExcel(groupId);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=students.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(file);
        }


    }


