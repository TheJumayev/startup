package com.example.backend.Controller;

import com.example.backend.DTO.DalolatnomaDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Dalolatnoma;
import com.example.backend.Entity.Groups;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.DalolatnomaRepo;
import com.example.backend.Repository.GroupsRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/dalolatnoma")
@RequiredArgsConstructor
public class DalolatnomaController {
    private final GroupsRepo groupsRepo;
    private final DalolatnomaRepo dalolatnomaRepo;
    private final AttachmentRepo attachmentRepo;

    @GetMapping
    public HttpEntity<?> getAllDalolatnoma(){
        List<Dalolatnoma> all = dalolatnomaRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    @PostMapping
    public HttpEntity<?> create(@RequestBody DalolatnomaDTO dto) {
        Optional<Groups> groupsOptional = groupsRepo.findById(dto.getGroupId());
        Optional<Attachment> attachmentOptional = attachmentRepo.findById(dto.getAttachementId());
        if (groupsOptional.isEmpty() && attachmentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Groups groups = groupsOptional.get();
        Attachment attachment = attachmentOptional.get();

        Dalolatnoma dalolatnoma = new Dalolatnoma();
        dalolatnoma.setGroups(groups);
        dalolatnoma.setAttachment(attachment);
        if (dto.getDescription() != null) {
            dalolatnoma.setDescription(dto.getDescription());
        }
        dalolatnoma.setCreatedAt(LocalDateTime.now());
        Dalolatnoma save = dalolatnomaRepo.save(dalolatnoma);
        return ResponseEntity.ok(save);

    }

    @PutMapping("/{id}")
    public HttpEntity<?> edit(@PathVariable UUID id, @RequestBody DalolatnomaDTO dto) {
        Optional<Groups> groupsOptional = groupsRepo.findById(dto.getGroupId());
        Optional<Attachment> attachmentOptional = attachmentRepo.findById(dto.getAttachementId());
        Optional<Dalolatnoma> dalolatnomaOptional = dalolatnomaRepo.findById(id);

        if (groupsOptional.isEmpty() && attachmentOptional.isEmpty() && dalolatnomaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Groups groups = groupsOptional.get();
        Attachment attachment = attachmentOptional.get();
        Dalolatnoma dalolatnoma = dalolatnomaOptional.get();

        dalolatnoma.setGroups(groups);
        dalolatnoma.setAttachment(attachment);
        if (dto.getDescription() != null) {
            dalolatnoma.setDescription(dto.getDescription());
        }
        dalolatnoma.setCreatedAt(LocalDateTime.now());
        Dalolatnoma save = dalolatnomaRepo.save(dalolatnoma);
        return ResponseEntity.ok(save);

    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable UUID id) {
        Optional<Dalolatnoma> dalolatnomaOptional = dalolatnomaRepo.findById(id);
        if (dalolatnomaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        dalolatnomaRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
