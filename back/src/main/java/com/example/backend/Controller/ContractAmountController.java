package com.example.backend.Controller;

import com.example.backend.Entity.Contract;
import com.example.backend.Entity.ContractAmount;
import com.example.backend.Repository.ContractAmountRepo;
import com.example.backend.Repository.ContractRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/contract-amount")
public class ContractAmountController {
    private final ContractAmountRepo contractAmountRepo;
    private final ContractRepo contractRepo;
    @GetMapping
    public HttpEntity<?> getContractAmount(){
        List<ContractAmount> contractAmount = contractAmountRepo.findAll();
        return ResponseEntity.ok(contractAmount.get(contractAmount.size()-1));
    }

    @PostMapping
    public HttpEntity<?> addContractAmount(@RequestBody ContractAmount contractAmount){
        contractAmountRepo.save(new ContractAmount(contractAmount.getAmount(), LocalDateTime.now()));
        return ResponseEntity.ok(contractAmount);
    }


    @GetMapping("/student/{studentIdNumber}")
    public HttpEntity<?> getContractAmountByStudentId(@PathVariable Long studentIdNumber){
        Contract byHemisId = contractRepo.findByHemisId(studentIdNumber);
        return ResponseEntity.ok(byHemisId);
    }

    @PostMapping("/student/{studentIdNumber}")
    public HttpEntity<?> addContractAmountByStudentId(@PathVariable Long studentIdNumber,@RequestBody Contract contract){
        Contract byHemisId = contractRepo.findByHemisId(studentIdNumber);
        byHemisId.setPayment(byHemisId.getPayment()+contract.getPayment());
        contractRepo.save(byHemisId);
        return ResponseEntity.ok(contract);
    }

}
