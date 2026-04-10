package com.example.backend.Config;

import com.example.backend.Entity.*;
import com.example.backend.Enums.AppealTypes;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class AutoRun implements CommandLineRunner {
    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final WeekDayRepo weekDayRepo;
    @Override
    public void run(String... args) throws Exception {

        if (roleRepo.findAll().isEmpty()) {
            saveRoles();
        }



        if (weekDayRepo.findAll().isEmpty()) {
            List<WeekDays> days = List.of(
                    new WeekDays(1, "DUSHANBA"),
                    new WeekDays(2, "SESHANBA"),
                    new WeekDays(3, "CHORSHANBA"), // Wednesday
                    new WeekDays(4, "PAYSHANBA"),  // Thursday
                    new WeekDays(5, "JUMA"),       // Friday
                    new WeekDays(6, "SHANBA"),     // Saturday
                    new WeekDays(7, "YAKSHANBA")   // Sunday
            );

            weekDayRepo.saveAll(days);
        }

        checkAndCreateUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        checkAndCreateUser("user", "00000000", "USER DEF", UserRoles.ROLE_USER);
        checkAndCreateUser("superadmin", "00000000", "Super Admin", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("Akobir", "Akobir", "Super Admin", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("rektor", "00000000", "Siddiqova Sadoqat G‘afforovna", UserRoles.ROLE_REKTOR);
        checkAndCreateUser("bugalter", "00000000", "Uchqun Jo'rayev", UserRoles.ROLE_BUGALTER);
        checkAndCreateUser("sekretar", "00000000", "Sekretar", UserRoles.ROLE_SECRETARY);
        checkAndCreateUser("bekzod", "00000000", "Test markaz", UserRoles.ROLE_TEST_CENTER);
        checkAndCreateUser("shuxrataka", "768627141", "Office registrator boshlig'i", UserRoles.ROLE_OFFICE);

    }







    private void checkAndCreateUser(String phone, String password, String name, UserRoles role) {
        Optional<User> userByPhone = userRepo.findByPhone(phone);

        if (userByPhone.isEmpty()) {

            Role roleEntity = roleRepo.findByName(role);

            if (roleEntity == null) {
                throw new RuntimeException("Role topilmadi: " + role);
            }

            User user = User.builder()
                    .phone(phone)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .roles(List.of(roleEntity))
                    .build();

            userRepo.save(user);
        }
    }
    private List<Role> saveRoles() {
        return roleRepo.saveAll(List.of(
                new Role(UserRoles.ROLE_ADMIN),
                new Role(UserRoles.ROLE_STUDENT),
                new Role(UserRoles.ROLE_REKTOR),
                new Role(UserRoles.ROLE_TEACHER),
                new Role(UserRoles.ROLE_SUPERADMIN),
                new Role(UserRoles.ROLE_USER),
                new Role(UserRoles.ROLE_DEKAN),
                new Role(UserRoles.ROLE_SECRETARY),
                new Role(UserRoles.ROLE_TEST_CENTER),
                new Role(UserRoles.ROLE_BUGALTER),
                new Role(UserRoles.ROLE_OFFICE)
        ));
    }


}
