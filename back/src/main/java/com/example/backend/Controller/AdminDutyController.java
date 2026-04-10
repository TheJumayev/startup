package com.example.backend.Controller;

import com.example.backend.DTO.AdminDutyDTO;
import com.example.backend.Entity.AdminDuty;
import com.example.backend.Entity.AppealType;
import com.example.backend.Entity.User;
import com.example.backend.Repository.AdminDutyRepo;
import com.example.backend.Repository.AppealTypeRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@ControllerAdvice
@CrossOrigin
@RequestMapping("/api/v1/admin-duty")
@RequiredArgsConstructor
public class AdminDutyController {

    private final UserRepo userRepo;
    private final AppealTypeRepo appealTypeRepo;
    private final AdminDutyRepo adminDutyRepo;

    // 🔹 Get all duties
    @GetMapping
    public HttpEntity<?> getAdminDuty() {
        List<AdminDuty> all = adminDutyRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    // 🔹 Get by Admin ID
    @GetMapping("/by-admin/{adminId}")
    public HttpEntity<?> getByAdminId(@PathVariable UUID adminId) {
        Optional<AdminDuty> duties = adminDutyRepo.findByAdminId(adminId);
        if (duties.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(duties.get(), HttpStatus.OK);
    }

    // 🔹 Add new duty
    @PostMapping
    public HttpEntity<?> addAdminDuty(@RequestBody AdminDutyDTO adminDutyDTO) {
        List<AppealType> appealTypes = new ArrayList<>();
        Optional<AdminDuty> byAdminId = adminDutyRepo.findByAdminId(adminDutyDTO.getAdminId());
        if(byAdminId.isPresent()){
            return  new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        for (UUID dutyId : adminDutyDTO.getDutyIds()) {
            Optional<AppealType> byId = appealTypeRepo.findById(dutyId);
            if (byId.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            appealTypes.add(byId.get());
        }

        Optional<User> byId1 = userRepo.findById(adminDutyDTO.getAdminId());
        if (byId1.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        User user = byId1.get();
        AdminDuty adminDuty = new AdminDuty(LocalDateTime.now(), user, appealTypes);
        AdminDuty save = adminDutyRepo.save(adminDuty);
        return new ResponseEntity<>(save, HttpStatus.CREATED);
    }

    // 🔹 Update duty
    @PutMapping("/{adminDutyId}")
    public HttpEntity<?> change(@RequestBody AdminDutyDTO adminDutyDTO, @PathVariable UUID adminDutyId) {
        Optional<AdminDuty> byId = adminDutyRepo.findById(adminDutyId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        AdminDuty adminDuty = byId.get();

        // update admin
        Optional<User> userOpt = userRepo.findById(adminDutyDTO.getAdminId());
        if (userOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        adminDuty.setAdmin(userOpt.get());

        // update appealTypes
        List<AppealType> appealTypes = new ArrayList<>();
        for (UUID dutyId : adminDutyDTO.getDutyIds()) {
            Optional<AppealType> appealOpt = appealTypeRepo.findById(dutyId);
            appealOpt.ifPresent(appealTypes::add);
        }
        adminDuty.setAppealType(appealTypes);
        adminDuty.setCreateAt(LocalDateTime.now());

        AdminDuty updated = adminDutyRepo.save(adminDuty);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // 🔹 Delete duty
    @DeleteMapping("/{adminDutyId}")
    public HttpEntity<?> delete(@PathVariable UUID adminDutyId) {
        Optional<AdminDuty> byId = adminDutyRepo.findById(adminDutyId);
        if (byId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        adminDutyRepo.delete(byId.get());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
