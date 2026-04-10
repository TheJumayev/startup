package com.example.backend.Controller;

import com.example.backend.DTO.UserSave;
import com.example.backend.Entity.DekanGroup;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.DekanGroupRepo;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.Group;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@ControllerAdvice
@RestController
@CrossOrigin
@RequestMapping("/api/v1/dekan")
@RequiredArgsConstructor
public class DekanController {

    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final GroupsRepo groupsRepo;
    private final DekanGroupRepo dekanGroupRepo;


    @PostMapping
    public HttpEntity<?> addAdmin(@RequestBody UserSave userSave) {
        if (userSave.getName() == null || userSave.getPassword() == null || userSave.getPhone() == null ||
                userSave.getName().isEmpty() || userSave.getPassword().isEmpty() || userSave.getPhone().isEmpty()) {
            return ResponseEntity.badRequest().body("Name, phone or password is missing");
        }

        Role adminRole = roleRepo.findByName(UserRoles.ROLE_DEKAN);
        if (adminRole == null) {
            return ResponseEntity.badRequest().body("Admin role not found");
        }

        String encodedPassword = passwordEncoder.encode(userSave.getPassword());

        User user = new User(userSave.getPhone(), encodedPassword, userSave.getName(), Collections.singletonList(adminRole));
        User saved = userRepo.save(user);
        return ResponseEntity.ok(saved);
    }



    @GetMapping
    public HttpEntity<?> getDekans() {
        List<User> allAdminsByRole = userRepo.findAllDeanByRoleId();
        return ResponseEntity.ok(allAdminsByRole);
    }


    @PutMapping("/{id}")
    public HttpEntity<?> updateAdmin(@PathVariable UUID id, @RequestBody UserSave userSave) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        if (userSave.getName() != null) user.setName(userSave.getName());
        if (userSave.getPhone() != null) user.setPhone(userSave.getPhone());
        if (userSave.getPassword() != null) {
            String encodedPassword = passwordEncoder.encode(userSave.getPassword());
            user.setPassword(encodedPassword);
        }

        User updated = userRepo.save(user);
        return ResponseEntity.ok(updated);
    }



    @DeleteMapping("/{id}")
    public HttpEntity<?> deleteAdmin(@PathVariable UUID id) {
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepo.deleteById(id);
        return ResponseEntity.ok("Admin deleted successfully");
    }

    @GetMapping("/all")
    public HttpEntity<?> getAllDekans() {
        return ResponseEntity.ok(dekanGroupRepo.findAll());
    }
    @GetMapping("/connect-group/{dekanId}")
    public HttpEntity<?> getConnectGroup(@PathVariable UUID dekanId) {
        Optional<DekanGroup> byId = dekanGroupRepo.findByDekanId(dekanId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(byId.get());
    }

    @GetMapping("/dekan-groups/{dekanGroupId}")
    public HttpEntity<?> getDekanGroup(@PathVariable UUID dekanGroupId) {
        Optional<DekanGroup> byId = dekanGroupRepo.findById(dekanGroupId);
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        DekanGroup dekanGroup = byId.get();
        return ResponseEntity.ok(dekanGroup);
    }
    @PutMapping("/dekan-groups/{dekanId}/{dekanGroupId}")
    public HttpEntity<?> editDekanGroup(@PathVariable UUID dekanId,
                                        @PathVariable UUID dekanGroupId,
                                        @RequestBody List<UUID> groupIds) {
        // 1. Check if Dekan (User) exists
        Optional<User> dekanOpt = userRepo.findById(dekanId);
        if (dekanOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Dekan not found");
        }
        User dekan = dekanOpt.get();

        // 2. Check if DekanGroup exists
        Optional<DekanGroup> dekanGroupOpt = dekanGroupRepo.findById(dekanGroupId);
        if (dekanGroupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ DekanGroup not found");
        }
        DekanGroup dekanGroup = dekanGroupOpt.get();

        // 3. Load new groups from DB
        List<Groups> groups = new ArrayList<>();
        for (UUID groupId : groupIds) {
            Optional<Groups> gOpt = groupsRepo.findById(groupId);
            if (gOpt.isPresent()) {
                groups.add(gOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Group not found: " + groupId);
            }
        }

        // 4. Update DekanGroup
        dekanGroup.setDekan(dekan);              // reassign to new dekan (if needed)
        dekanGroup.setGroup(groups);             // update groups

        // 5. Save changes
        DekanGroup saved = dekanGroupRepo.save(dekanGroup);

        return ResponseEntity.ok(saved);
    }


    @PostMapping("/dekan-groups/{dekanId}")
    public HttpEntity<?> addGroup(@RequestBody List<UUID> groupIds, @PathVariable UUID dekanId) {
        Optional<User> byId = userRepo.findById(dekanId);
        Optional<DekanGroup> dekan10 = dekanGroupRepo.findByDekanId(dekanId);
        if(dekan10.isPresent()) return ResponseEntity.status(500).build();
        if (byId.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User dekan = byId.get();
        DekanGroup dekanGroup = new DekanGroup();
        List<Groups> groups = new ArrayList<>();
        for (UUID groupId : groupIds) {
            Groups group = groupsRepo.findById(groupId).get();
            groups.add(group);
        }
        dekanGroup.setGroup(groups);
        dekanGroup.setCreatedAt(LocalDateTime.now());
        dekanGroup.setDekan(dekan);
        dekanGroupRepo.save(dekanGroup);
        return ResponseEntity.ok(dekanGroup);
    }
}
