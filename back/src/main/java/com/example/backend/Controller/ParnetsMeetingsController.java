package com.example.backend.Controller;

import com.example.backend.DTO.ParentsMeetingsDTO;
import com.example.backend.Entity.ParentsMeetings;
import com.example.backend.Entity.Student;
import com.example.backend.Repository.ParentsMeetingsRepo;
import com.example.backend.Repository.StudentRepo;
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
@RequestMapping("/api/v1/parents-meetings")
public class ParnetsMeetingsController {
    private final StudentRepo studentRepo;
    private final ParentsMeetingsRepo parentsMeetingsRepo;

    @GetMapping
    public HttpEntity<?> getAllParentsMeetings() {
        List<ParentsMeetings> all = parentsMeetingsRepo.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }


    @PostMapping
    public HttpEntity<?> create(@RequestBody ParentsMeetingsDTO dto){
        Optional<Student> studentOpt = studentRepo.findById(dto.getStudentId());
        if (studentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Student student = studentOpt.get();

        ParentsMeetings parentsMeetings = ParentsMeetings.builder()
                .student(student)
                .status(dto.getStatus())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        ParentsMeetings save = parentsMeetingsRepo.save(parentsMeetings);
        return new ResponseEntity<>(save, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> update(@PathVariable UUID id, @RequestBody ParentsMeetingsDTO dto){
        Optional<Student> studentOpt = studentRepo.findById(dto.getStudentId());
        if (studentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Student student = studentOpt.get();

        Optional<ParentsMeetings> parentsMeetingsOptional = parentsMeetingsRepo.findById(id);
        if (parentsMeetingsOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        ParentsMeetings parentsMeetings = parentsMeetingsOptional.get();

        parentsMeetings.setStudent(student);
        parentsMeetings.setStatus(dto.getStatus());
        parentsMeetings.setDescription(dto.getDescription());
        ParentsMeetings save = parentsMeetingsRepo.save(parentsMeetings);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(@PathVariable UUID id){
        Optional<Student> studentOpt = studentRepo.findById(id);
        if (studentOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        parentsMeetingsRepo.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
