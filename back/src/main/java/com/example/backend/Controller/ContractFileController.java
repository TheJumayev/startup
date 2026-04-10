package com.example.backend.Controller;

import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Contract;
import com.example.backend.Entity.ContractFile;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.ContractFileRepo;
import com.example.backend.Repository.ContractRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/contract-file")
public class ContractFileController {

    private final ContractFileRepo contractFileRepo;
    private final AttachmentRepo attachmentRepo;
    private final ContractRepo contractRepo;

    @GetMapping
    public HttpEntity<?> getContractFile() {
        List<ContractFile> contractFiles = contractFileRepo.findAll();
        return ResponseEntity.ok(contractFiles);
    }

    @GetMapping("/{fileId}")
    public HttpEntity<?> addContractFile(@PathVariable UUID fileId) {
        Attachment attachment = attachmentRepo.findById(fileId).orElse(null);
        if (attachment == null) {
            return ResponseEntity.badRequest().body("Attachment not found");
        }

        ContractFile contractFile = new ContractFile(attachment, LocalDateTime.now());
        contractFileRepo.save(contractFile);

        importContractsFromExcel(fileId);

        return ResponseEntity.ok("Import completed");
    }

    public void importContractsFromExcel(UUID fileId) {
        System.out.println("📄 Import started for fileId: " + fileId);
        contractRepo.deleteAll();

        Attachment attachment = attachmentRepo.findById(fileId).orElse(null);
        if (attachment == null) {
            System.out.println("❌ Attachment not found!");
            return;
        }

        String filePath = "backend/files" + attachment.getPrefix() + "/" + attachment.getName();
        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = WorkbookFactory.create(fis)) {

            // ✅ New Excel structure - single sheet "Analiz All"
            Sheet sheet = workbook.getSheet("Analiz All");
            if (sheet == null) {
                System.out.println("❌ Sheet 'Analiz All' not found!");
                return;
            }

            for (Row row : sheet) {

                if (row.getRowNum() == 0) continue; // Skip header row

                try {

                    // ✅ New column mappings:
                    // fullName => B(1)
                    // passportNumber => C(2)
                    // hemisId => D(3)
                    // level => G(6)
                    // discount => O(14)
                    // amount => AA(26)
                    // payment => AB(27)
                    // debt => AC(28)
                    // extra => AD(29)

                    String fullName = getCellValue(row.getCell(1)).toString();
                    System.out.println(fullName);
                    String passportNumber = getCellValue(row.getCell(2)).toString();
                    System.out.println(passportNumber);
                    Long hemisId = parseLong(getCellValue(row.getCell(3)));
                    System.out.println(hemisId);
                    String level = getCellValue(row.getCell(6)).toString();
                    System.out.println(level);
                    Integer discount = parseInteger(getCellValue(row.getCell(14)));
                    System.out.println(discount);
                    Integer amount = parseInteger(getCellValue(row.getCell(26)));
                    System.out.println(amount);
                    Integer payment = parseInteger(getCellValue(row.getCell(27)));
                    Integer debt = parseInteger(getCellValue(row.getCell(28)));
                    Integer extra = parseInteger(getCellValue(row.getCell(29)));

                    System.out.println(fullName);
                    System.out.println(payment);

                    if (passportNumber == null || passportNumber.isBlank()) continue;

                    Optional<Contract> existing = contractRepo.findByPassportNumber(passportNumber);
                    if (existing.isPresent()) {
                        System.out.println("⚠️ Skipping duplicate passport: " + passportNumber);
                        continue;
                    }

                    // ✅ Create and save contract
                    Contract contract = new Contract(
                            fullName,
                            level,
                            hemisId,
                            amount,
                            payment,
                            debt,
                            extra,
                            LocalDateTime.now(),
                            passportNumber,
                            discount,
                            true // default status = true
                    );

                    contractRepo.save(contract);
                    System.out.println("✅ Saved contract: " + fullName);

                } catch (Exception e) {
                    System.out.println("❌ Error processing row " + row.getRowNum() + ": " + e.getMessage());

                    // Save with status = false when error occurs
                    try {
                        String fullName = getCellValue(row.getCell(1)).toString();
                        String passportNumber = getCellValue(row.getCell(2)).toString();
                        Contract failedContract = new Contract(
                                fullName,
                                "Unknown",
                                null,
                                null,
                                null,
                                null,
                                null,
                                LocalDateTime.now(),
                                passportNumber,
                                null,
                                false
                        );
                        contractRepo.save(failedContract);
                    } catch (Exception ignored) {
                    }
                }
            }

            System.out.println("✅ Import finished successfully!");

        } catch (Exception e) {
            System.out.println("❌ Failed to import contracts: " + e.getMessage());
        }
    }

    // ✅ Helper methods

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        try {
            String strValue = value.toString().trim();
            if (strValue.isEmpty()) return null;
            return (int) Double.parseDouble(strValue);
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseLong(Object value) {
        if (value == null) return null;
        try {
            String strValue = value.toString().trim();
            if (strValue.isEmpty()) return null;
            return Long.parseLong(strValue);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                } else {
                    return String.format("%.0f", cell.getNumericCellValue());
                }
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                FormulaEvaluator evaluator = cell.getSheet().getWorkbook().getCreationHelper().createFormulaEvaluator();
                CellValue cellValue = evaluator.evaluate(cell);
                switch (cellValue.getCellType()) {
                    case STRING:
                        return cellValue.getStringValue();
                    case NUMERIC:
                        return String.format("%.0f", cellValue.getNumberValue());
                    case BOOLEAN:
                        return cellValue.getBooleanValue();
                    default:
                        return "";
                }
            default:
                return "";
        }
    }
}
