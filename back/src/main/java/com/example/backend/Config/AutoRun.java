package com.example.backend.Config;

import com.example.backend.Entity.Role;
import com.example.backend.Entity.User;
import com.example.backend.Entity.Groups;
import com.example.backend.Entity.Subjects;

import com.example.backend.Entity.*;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.GroupsRepo;
import com.example.backend.Repository.RoleRepo;
import com.example.backend.Repository.SubjectsRepo;
import com.example.backend.Repository.UserRepo;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class AutoRun implements CommandLineRunner {

    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final GroupsRepo groupsRepo;
    private final SubjectsRepo subjectsRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Barcha rollarni tekshirib, yo'qlarini yaratish
        saveRoles();

        checkAndCreateUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        checkAndCreateUser("user", "00000000", "USER DEF", UserRoles.ROLE_USER);
        checkAndCreateUser("superadmin", "00000000", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("teacher", "00000000", "Teacher", UserRoles.ROLE_TEACHER);
        checkAndCreateUser("Akobir", "Akobir", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        checkAndCreateUser("rektor", "00000000", "REKTOR", UserRoles.ROLE_REKTOR);

        // Groups va Subjects yaratish (30 tadan)
        if (groupsRepo.count() == 0) {
            createGroups();
        }
        if (subjectsRepo.count() == 0) {
            createSubjects();
        }
    }

    private void saveRoles() {
        for (UserRoles roleEnum : UserRoles.values()) {
            try {
                if (roleRepo.findByName(roleEnum).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleEnum);
                    roleRepo.save(role);
                    System.out.println("✅ Role yaratildi: " + roleEnum);
                }
            } catch (Exception e) {
                System.out.println("⚠️ Role yaratishda xato (" + roleEnum + "): " + e.getMessage());
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

    private void createGroups() {
        String[][] groupData = {
                {"CS-101", "Kompyuter fanlari 1-kurs 1-guruh", "1-semestr"},
                {"CS-102", "Kompyuter fanlari 1-kurs 2-guruh", "1-semestr"},
                {"CS-201", "Kompyuter fanlari 2-kurs 1-guruh", "3-semestr"},
                {"CS-202", "Kompyuter fanlari 2-kurs 2-guruh", "3-semestr"},
                {"CS-301", "Kompyuter fanlari 3-kurs 1-guruh", "5-semestr"},
                {"CS-302", "Kompyuter fanlari 3-kurs 2-guruh", "5-semestr"},
                {"CS-401", "Kompyuter fanlari 4-kurs 1-guruh", "7-semestr"},
                {"CS-402", "Kompyuter fanlari 4-kurs 2-guruh", "7-semestr"},
                {"IT-101", "Axborot texnologiyalari 1-kurs 1-guruh", "1-semestr"},
                {"IT-102", "Axborot texnologiyalari 1-kurs 2-guruh", "1-semestr"},
                {"IT-201", "Axborot texnologiyalari 2-kurs 1-guruh", "3-semestr"},
                {"IT-202", "Axborot texnologiyalari 2-kurs 2-guruh", "3-semestr"},
                {"IT-301", "Axborot texnologiyalari 3-kurs 1-guruh", "5-semestr"},
                {"IT-302", "Axborot texnologiyalari 3-kurs 2-guruh", "5-semestr"},
                {"IT-401", "Axborot texnologiyalari 4-kurs 1-guruh", "7-semestr"},
                {"IT-402", "Axborot texnologiyalari 4-kurs 2-guruh", "7-semestr"},
                {"SE-101", "Dasturiy injiniring 1-kurs 1-guruh", "1-semestr"},
                {"SE-102", "Dasturiy injiniring 1-kurs 2-guruh", "1-semestr"},
                {"SE-201", "Dasturiy injiniring 2-kurs 1-guruh", "3-semestr"},
                {"SE-202", "Dasturiy injiniring 2-kurs 2-guruh", "3-semestr"},
                {"SE-301", "Dasturiy injiniring 3-kurs 1-guruh", "5-semestr"},
                {"SE-302", "Dasturiy injiniring 3-kurs 2-guruh", "5-semestr"},
                {"AI-101", "Sun'iy intellekt 1-kurs 1-guruh", "1-semestr"},
                {"AI-102", "Sun'iy intellekt 1-kurs 2-guruh", "1-semestr"},
                {"AI-201", "Sun'iy intellekt 2-kurs 1-guruh", "3-semestr"},
                {"AI-202", "Sun'iy intellekt 2-kurs 2-guruh", "3-semestr"},
                {"DS-101", "Ma'lumotlar fani 1-kurs 1-guruh", "1-semestr"},
                {"DS-102", "Ma'lumotlar fani 1-kurs 2-guruh", "1-semestr"},
                {"CY-101", "Kiberxavfsizlik 1-kurs 1-guruh", "1-semestr"},
                {"CY-102", "Kiberxavfsizlik 1-kurs 2-guruh", "1-semestr"},
        };

        for (String[] g : groupData) {
            groupsRepo.save(Groups.builder()
                    .name(g[0])
                    .description(g[1])
                    .semesterName(g[2])
                    .createdAt(LocalDateTime.now())
                    .build());
        }
        System.out.println("✅ 30 ta guruh yaratildi");
    }

    private void createSubjects() {
        String[][] subjectData = {
                {"Matematika", "Oliy matematika asoslari"},
                {"Fizika", "Umumiy fizika kursi"},
                {"Informatika", "Kompyuter savodxonligi va asoslari"},
                {"Dasturlash asoslari", "Python, Java asosiy tushunchalar"},
                {"Ma'lumotlar tuzilmasi", "Array, LinkedList, Tree, Graph"},
                {"Algoritmlar", "Sorting, Searching, Dynamic Programming"},
                {"Ob'ektga yo'naltirilgan dasturlash", "OOP - Java, C++"},
                {"Ma'lumotlar bazasi", "SQL, PostgreSQL, MySQL"},
                {"Web dasturlash", "HTML, CSS, JavaScript, React"},
                {"Mobil dasturlash", "Android, iOS, Flutter"},
                {"Operatsion tizimlar", "Linux, Windows, Kernel"},
                {"Kompyuter tarmoqlari", "TCP/IP, DNS, HTTP"},
                {"Kiberxavfsizlik", "Xavfsizlik asoslari, Encryption"},
                {"Sun'iy intellekt", "AI, Machine Learning asoslari"},
                {"Chuqur o'rganish", "Deep Learning, Neural Networks"},
                {"Kompyuter ko'rishi", "Computer Vision, OpenCV"},
                {"Tabiiy tilni qayta ishlash", "NLP, Chatbot, GPT"},
                {"Bulutli hisoblash", "AWS, Azure, Google Cloud"},
                {"DevOps", "Docker, Kubernetes, CI/CD"},
                {"Loyiha boshqaruvi", "Agile, Scrum, Kanban"},
                {"Ingliz tili", "Technical English"},
                {"Rus tili", "Texnik rus tili"},
                {"Falsafa", "Falsafa asoslari"},
                {"Iqtisodiyot", "Mikroiqtisodiyot va Makroiqtisodiyot"},
                {"Raqamli elektronika", "Digital Logic Design"},
                {"Statistika", "Ehtimollar nazariyasi va statistika"},
                {"Grafik dizayn", "Figma, Adobe Photoshop"},
                {"Dasturiy ta'minot injiniringi", "Software Engineering"},
                {"Blokcheyn texnologiyasi", "Blockchain, Smart Contracts"},
                {"IoT", "Internet of Things asoslari"},
        };

        for (String[] s : subjectData) {
            subjectsRepo.save(Subjects.builder()
                    .name(s[0])
                    .description(s[1])
                    .createAt(LocalDate.now())
                    .build());
        }
        System.out.println("✅ 30 ta fan yaratildi");
    }
}