package com.example.backend.Controller;

import com.example.backend.Entity.UniverPc;
import com.example.backend.Repository.UniverPcRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/univer-pc")
public class UniverPcController {

    private final UniverPcRepo univerPcRepo;

    // 🔵 CREATE
    @PostMapping
    public HttpEntity<?> create(@RequestBody UniverPc univerPc) {
        univerPc.setCreatedAt(LocalDateTime.now());
        UniverPc saved = univerPcRepo.save(univerPc);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 🟢 GET ALL
    @GetMapping
    public HttpEntity<?> getAll() {
        List<UniverPc> list = univerPcRepo.findAll();
        return ResponseEntity.ok(list);
    }

    // 🟡 GET BY ID
    @GetMapping("/{id}")
    public HttpEntity<?> getById(@PathVariable UUID id) {
        Optional<UniverPc> optional = univerPcRepo.findById(id);
        if (optional.isPresent()) {
            return ResponseEntity.ok(optional.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 🟠 UPDATE
    @PutMapping("/{id}")
    public HttpEntity<?> update(@PathVariable UUID id, @RequestBody UniverPc univerPc) {
        Optional<UniverPc> optional = univerPcRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("UniverPc not found");
        }

        UniverPc old = optional.get();
        old.setName(univerPc.getName());
        old.setAddress(univerPc.getAddress());
        // createdAt is not changed

        UniverPc updated = univerPcRepo.save(old);
        return ResponseEntity.ok(updated);
    }

    // 🔴 DELETE
    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable UUID id) {
        if (!univerPcRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("UniverPc not found");
        }

        univerPcRepo.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
