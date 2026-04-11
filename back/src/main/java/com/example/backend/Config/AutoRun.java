package com.example.backend.Config;

import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;

import com.example.backend.Entity.*;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.UserRepo;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
@Configuration
@RequiredArgsConstructor
public class AutoRun implements CommandLineRunner {

    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (roleRepo.findAll().isEmpty()) {
            saveRoles();
        }

        List<Role> all = roleRepo.findAll();

        if (all.size() == 10) {
            Role role = new Role();
            role.setName(UserRoles.ROLE_OFFICE);
            roleRepo.save(role);
        }

        checkAndCreateUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        checkAndCreateUser("user", "00000000", "USER DEF", UserRoles.ROLE_USER);
        checkAndCreateUser("superadmin", "00000000", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("teacher", "00000000", "Teacher", UserRoles.ROLE_TEACHER);
        checkAndCreateUser("Akobir", "Akobir", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("rektor", "00000000", "REKTOR", UserRoles.ROLE_REKTOR);
    }

    private void saveRoles() {
        for (UserRoles roleEnum : UserRoles.values()) {
            if (roleRepo.findByName(roleEnum).isEmpty()) {
                Role role = new Role();
                role.setName(roleEnum);
                roleRepo.save(role);
            }
        }
    }

    private void checkAndCreateUser(String phone, String password, String name, UserRoles roleEnum) {

        Optional<Role> roleOpt = roleRepo.findByName(roleEnum);

        if (roleOpt.isEmpty()) {
            throw new RuntimeException("ROLE NOT FOUND: " + roleEnum);
        }

        Optional<User> userByPhone = userRepo.findByPhone(phone);

        if (userByPhone.isEmpty()) {

            User user = User.builder()
                    .phone(phone)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .roles(List.of(roleOpt.get()))
                    .build();

            userRepo.save(user);
        }
    }
}