package com.example.backend.Controller;

import com.example.backend.Entity.Groups;
import com.example.backend.Entity.TelegramGroup;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.TelegramGroupRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/telegram_group")
public class TelegramGroupController {

    private final GroupsRepo groupsRepo;
    private final TelegramGroupRepo telegramGroupRepo;

    // ✅ Get all telegram groups
    @GetMapping
    public HttpEntity<?> getAll() {
        List<TelegramGroup> telegramGroups = telegramGroupRepo.findAll();
        return new ResponseEntity<>(telegramGroups, HttpStatus.OK);
    }

    // ✅ Get one by ID
    @GetMapping("/{id}")
    public HttpEntity<?> getById(@PathVariable UUID id) {
        Optional<TelegramGroup> tgGroup = telegramGroupRepo.findById(id);
        if (tgGroup.isEmpty()) {
            return new ResponseEntity<>("Telegram group not found", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(tgGroup.get(), HttpStatus.OK);
    }

    // ✅ Create new (assign Telegram group to university group)
    @PostMapping("/{groupId}/{tgGroupId}")
    public HttpEntity<?> addGroup(@PathVariable UUID groupId, @PathVariable BigInteger tgGroupId) {

        Optional<Groups> groupOpt = groupsRepo.findById(groupId);
        if (groupOpt.isEmpty()) {
            return new ResponseEntity<>("Group not found", HttpStatus.NOT_FOUND);
        }

        Groups group = groupOpt.get();

        // Ensure unique mapping (avoid duplicates)
        Optional<TelegramGroup> existing = telegramGroupRepo.findByGroup(group);
        if (existing.isPresent()) {
            return new ResponseEntity<>("Telegram group already exists for this group", HttpStatus.CONFLICT);
        }

        TelegramGroup telegramGroup = new TelegramGroup(tgGroupId, LocalDateTime.now(), group, true);
        TelegramGroup saved = telegramGroupRepo.save(telegramGroup);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ✅ Update existing TelegramGroup (e.g., toggle active, change tgGroupId)
    @PutMapping("/{id}")
    public HttpEntity<?> updateGroup(
            @PathVariable UUID id,
            @RequestBody TelegramGroup updatedGroup
    ) {
        Optional<TelegramGroup> existingOpt = telegramGroupRepo.findById(id);
        if (existingOpt.isEmpty()) {
            return new ResponseEntity<>("Telegram group not found", HttpStatus.NOT_FOUND);
        }

        TelegramGroup existing = existingOpt.get();

        // Update only allowed fields
        if (updatedGroup.getGroupTelegramId() != null)
            existing.setGroupTelegramId(updatedGroup.getGroupTelegramId());

        if (updatedGroup.getIsActive() != null)
            existing.setIsActive(updatedGroup.getIsActive());

        existing.setCreatedAt(LocalDateTime.now());
        TelegramGroup saved = telegramGroupRepo.save(existing);

        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    // ✅ Delete TelegramGroup by ID
    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteGroup(@PathVariable UUID id) {
        Optional<TelegramGroup> existing = telegramGroupRepo.findById(id);
        if (existing.isEmpty()) {
            return new ResponseEntity<>("Telegram group not found", HttpStatus.NOT_FOUND);
        }
        telegramGroupRepo.delete(existing.get());
        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }
}
