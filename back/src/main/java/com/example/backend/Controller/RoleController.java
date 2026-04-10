package com.example.backend.Controller;

import com.example.backend.Entity.Role;
import com.example.backend.Repository.RoleRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/role")
public class RoleController {
    private  final RoleRepo roleRepo;
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleRepo.findAll();
        return ResponseEntity.ok(roles);
    }
}
