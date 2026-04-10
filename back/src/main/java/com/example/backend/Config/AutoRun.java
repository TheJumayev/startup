package com.example.backend.Config;

import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Entity.WeekDays;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.UserRepo;
import com.example.backend.Repository.WeekDayRepo;
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
    private final WeekDayRepo weekDayRepo;

    @Override
    public void run(String... args) {

        // ✅ 1. Создаем ВСЕ роли
        saveRoles();

        // ✅ 2. Дни недели
        if (weekDayRepo.findAll().isEmpty()) {
            weekDayRepo.saveAll(List.of(
                    new WeekDays(1, "DUSHANBA"),
                    new WeekDays(2, "SESHANBA"),
                    new WeekDays(3, "CHORSHANBA"),
                    new WeekDays(4, "PAYSHANBA"),
                    new WeekDays(5, "JUMA"),
                    new WeekDays(6, "SHANBA"),
                    new WeekDays(7, "YAKSHANBA")
            ));
        }

        // ✅ 3. Пользователи
        checkAndCreateUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        checkAndCreateUser("user", "00000000", "User", UserRoles.ROLE_USER);
        checkAndCreateUser("superadmin", "00000000", "Super Admin", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("rektor", "00000000", "Rektor", UserRoles.ROLE_REKTOR);
        checkAndCreateUser("bugalter", "00000000", "Bugalter", UserRoles.ROLE_BUGALTER);
        checkAndCreateUser("sekretar", "00000000", "Sekretar", UserRoles.ROLE_SECRETARY);
        checkAndCreateUser("test", "00000000", "Test Center", UserRoles.ROLE_TEST_CENTER);
        checkAndCreateUser("office", "00000000", "Office", UserRoles.ROLE_OFFICE);
    }

    // ✅ создание ролей безопасно
    private void saveRoles() {
        for (UserRoles roleEnum : UserRoles.values()) {
            if (roleRepo.findByName(roleEnum) == null) {
                Role role = new Role();
                role.setName(roleEnum);
                roleRepo.save(role);
            }
        }
    }

    // ✅ создание пользователя безопасно
    private void checkAndCreateUser(String phone, String password, String name, UserRoles roleEnum) {

        Optional<User> userByPhone = userRepo.findByPhone(phone);

        if (userByPhone.isEmpty()) {

            Role role = roleRepo.findByName(roleEnum);

            if (role == null) {
                throw new RuntimeException("ROLE NOT FOUND: " + roleEnum);
            }

            User user = User.builder()
                    .phone(phone)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .roles(List.of(role))
                    .build();

            userRepo.save(user);
        }
    }
}