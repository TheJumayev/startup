package com.example.backend.Controller;

import com.example.backend.DTO.MustaqilExamDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
@RequestMapping("/api/v1/mustaqil-exam")
public class MustaqilExamController {
    private final MustaqilExamRepo mustaqilExamRepo;
    private final CurriculumSubjectRepo curriculumSubjectRepo;
    private final UserRepo userRepo;
    private final GroupsRepo groupsRepo;
  @PostMapping
  public HttpEntity<?> createExam(@RequestBody MustaqilExamDTO dto) {
      Optional<CurriculumSubject> curriculumSubject = curriculumSubjectRepo.findById(dto.getCurriculumSubjectId());
      if (curriculumSubject.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      Optional<Groups> group = groupsRepo.findById(dto.getGroupId());
      if (group.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      List<User> user = userRepo.findAllTestCenterByRole();
          if (user.isEmpty()) {
              return new ResponseEntity<>(HttpStatus.NOT_FOUND);
          }
      Optional<MustaqilExam> mustaqilExam = mustaqilExamRepo.findByCurriculumSubjectIdAndGroupId(dto.getCurriculumSubjectId(), dto.getGroupId());
      if (mustaqilExam.isPresent()) {
          return ResponseEntity.status(HttpStatus.CONFLICT)
                  .body("Exam for this subject and group ALREADY exists!");
      }
      try{
          MustaqilExam exam = new MustaqilExam(
                  dto.getName(),
                  curriculumSubject.get(),
                  user.get(0),
                  group.get(),
                  25,
                  25,
                  dto.getAttempts(),
                  dto.getStatus(),
                  1,
                  dto.getStartTime(),
                  dto.getEndTime(),
                  LocalDateTime.now(),
                  30,
                  dto.getIsAmaliy()
          );
          MustaqilExam save = mustaqilExamRepo.save(exam);
          return ResponseEntity.ok(save);
      }catch (DataIntegrityViolationException e){
          return ResponseEntity.status(HttpStatus.CONFLICT)
                  .body("Duplicate exam (subject + group must be unique)");
      }
  }

  @PutMapping("/{id}")
  public HttpEntity<?>  updateExam(@PathVariable UUID id, @RequestBody MustaqilExamDTO dto) {
      Optional<MustaqilExam> mustaqilExam = mustaqilExamRepo.findById(id);
      if (mustaqilExam.isEmpty()) {
          return ResponseEntity.ok(HttpStatus.NOT_FOUND);
      }
      MustaqilExam exam = mustaqilExam.get();
      exam.setName(dto.getName());
      exam.setAttempts(dto.getAttempts());
      exam.setIsAmaliy(dto.getIsAmaliy());
      exam.setStatus(dto.getStatus());
      exam.setStartTime(dto.getStartTime());
      exam.setEndTime(dto.getEndTime());
      MustaqilExam save = mustaqilExamRepo.save(exam);
      return ResponseEntity.ok(save);
  }

  @GetMapping
  public HttpEntity<?> getExamById() {
      List<MustaqilExam> all = mustaqilExamRepo.findAll();
      return  ResponseEntity.ok(all);
  }

  @GetMapping("/{id}")
  public HttpEntity<?> getExam(@PathVariable UUID id) {
      Optional<MustaqilExam> exam = mustaqilExamRepo.findById(id);
      if (exam.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      return ResponseEntity.ok(exam.get());
  }

  @PutMapping("/change-status/{id}")
  public HttpEntity<?> editStatus(@PathVariable UUID id, @RequestBody MustaqilExamDTO dto) {
      Optional<MustaqilExam> exam = mustaqilExamRepo.findById(id);
      if (exam.isEmpty()) {
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
      }
      MustaqilExam examOld = exam.get();
      examOld.setStatus(dto.getStatus());
      MustaqilExam save = mustaqilExamRepo.save(examOld);
      return ResponseEntity.ok(save);
  }

  @DeleteMapping("/{id}")
  public HttpEntity<?> deleteExam(@PathVariable UUID id) {
      if (!mustaqilExamRepo.existsById(id)) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Exam not found");
      }
      mustaqilExamRepo.deleteById(id);
      return ResponseEntity.ok("Deleted successfully");
  }

}
