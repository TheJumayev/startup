package com.example.backend.Controller;

import com.example.backend.Entity.AppealType;
import com.example.backend.Entity.Reason;
import com.example.backend.Repository.AppealTypeRepo;
import com.example.backend.Repository.ReasonRepo;
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
@RequestMapping("/api/v1/reason")
public class ReasonController {

    private final ReasonRepo reasonRepo;
    private final AppealTypeRepo appealTypeRepo;



    @GetMapping("/{appealTypeId}")
    public HttpEntity<?> getReason(@PathVariable UUID appealTypeId){
       List<Reason> all = reasonRepo.findByAppealTypeId(appealTypeId);
       return ResponseEntity.ok(all);
    }



    @PostMapping("/{appealTypeId}")
    public HttpEntity<?> addReason(@PathVariable UUID appealTypeId, @RequestBody Reason reason){

        Optional<AppealType> byId = appealTypeRepo.findById(appealTypeId);
        if (byId.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Reason reason1 = new Reason(byId.get(), reason.getName(), LocalDateTime.now());
        Reason save = reasonRepo.save(reason1);
        return ResponseEntity.ok(save);
    }
    @DeleteMapping("/reasonId")
    public HttpEntity<?> deleteReason(@PathVariable UUID reasonId){
        reasonRepo.deleteById(reasonId);
        return ResponseEntity.noContent().build();
    }




}
