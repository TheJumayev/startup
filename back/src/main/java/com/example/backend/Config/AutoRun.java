package com.example.backend.Config;

import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Entity.WeekDays;
import com.example.backend.Entity.*;
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

    @Override
    public void run(String... args) throws Exception {
        if (roleRepo.findAll().isEmpty()) {
            saveRoles();
        }
        List<Role> all = roleRepo.findAll();
        if(all.size() ==9){
            UserRoles roleBugalter = UserRoles.ROLE_BUGALTER;
            Role role = new Role(10, roleBugalter);
            roleRepo.saveAll(List.of(role));
        }

       if(all.size() ==10){
           UserRoles roleBugalter = UserRoles.ROLE_OFFICE;
           Role role = new Role(11, roleBugalter);
           roleRepo.saveAll(List.of(role));
       }

        // ✅ 3. Пользователи
        checkAndCreateUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        checkAndCreateUser("user", "00000000", "USER DEF", UserRoles.ROLE_USER);
        checkAndCreateUser("superadmin", "00000000", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("Akobir", "Akobir", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("rektor", "00000000", "REKTOR", UserRoles.ROLE_REKTOR);
        checkAndCreateUser("bugalter", "00000000", "Uchqun Jo'rayev", UserRoles.ROLE_BUGALTER);

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

    private void checkAndCreateUser(String phone, String password, String name, UserRoles role) {
        Optional<Role> byName = roleRepo.findByName(role);
        if (byName.isEmpty()) {
            return;
        }
        List<Role> all = List.of(byName.get());


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
                    .roles(all)
                    .build();

            userRepo.save(user);
        }
    }

    private List<Role> saveRoles() {
        return roleRepo.saveAll(List.of(
                new Role(1, UserRoles.ROLE_ADMIN),
                new Role(2, UserRoles.ROLE_STUDENT),
                new Role(3, UserRoles.ROLE_REKTOR),
                new Role(5, UserRoles.ROLE_SUPERADMIN),
                new Role(6, UserRoles.ROLE_USER)
        ));
    }


}
