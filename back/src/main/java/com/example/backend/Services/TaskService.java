package com.example.backend.Services;

import com.example.backend.Entity.Task;
import com.example.backend.Repository.TaskRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepo taskRepo;

    public Task save(Task task) {
        return taskRepo.save(task);
    }
}