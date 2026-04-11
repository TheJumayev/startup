package com.example.backend.Config;

import com.example.backend.Entity.*;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.*;

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
    private final StudentRepo studentRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        saveRoles();
        createDefaultUsers();
        createGroupsIfEmpty();
        createSubjectsIfEmpty();
        createStudentsIfEmpty();
    }

    // ===================== ROLES =====================
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
                System.out.println("⚠️ Role xato (" + roleEnum + "): " + e.getMessage());
            }
        }
    }

    // ===================== USERS =====================
    private void createDefaultUsers() {
        createUser("admin", "00000000", "Default Admin", UserRoles.ROLE_ADMIN);
        createUser("user", "00000000", "USER DEF", UserRoles.ROLE_USER);
        createUser("superadmin", "00000000", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        createUser("teacher", "00000000", "Teacher", UserRoles.ROLE_TEACHER);
        createUser("Akobir", "Akobir", "SUPER ADMIN", UserRoles.ROLE_SUPERADMIN);
        createUser("rektor", "00000000", "REKTOR", UserRoles.ROLE_REKTOR);
    }

    private void createUser(String phone, String password, String name, UserRoles roleEnum) {
        Optional<Role> roleOpt = roleRepo.findByName(roleEnum);
        if (roleOpt.isEmpty()) {
            System.out.println("⚠️ ROLE NOT FOUND: " + roleEnum);
            return;
        }
        if (userRepo.findByPhone(phone).isEmpty()) {
            userRepo.save(User.builder()
                    .phone(phone)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .roles(List.of(roleOpt.get()))
                    .build());
        }
    }

    // ===================== GROUPS =====================
    private void createGroupsIfEmpty() {
        if (groupsRepo.count() > 0) return;

        String[][] data = {
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
        for (String[] g : data) {
            groupsRepo.save(Groups.builder()
                    .name(g[0]).description(g[1]).semesterName(g[2])
                    .createdAt(LocalDateTime.now()).build());
        }
        System.out.println("✅ 30 ta guruh yaratildi");
    }

    // ===================== SUBJECTS =====================
    private void createSubjectsIfEmpty() {
        if (subjectsRepo.count() > 0) return;

        String[][] data = {
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
        for (String[] s : data) {
            subjectsRepo.save(Subjects.builder()
                    .name(s[0]).description(s[1])
                    .createAt(LocalDate.now()).build());
        }
        System.out.println("✅ 30 ta fan yaratildi");
    }

    // ===================== STUDENTS =====================
    private void createStudentsIfEmpty() {
        if (studentRepo.count() > 0) return;

        List<Groups> groups = groupsRepo.findAll();
        if (groups.isEmpty()) {
            System.out.println("⚠️ Guruhlar topilmadi — talabalar yaratilmadi");
            return;
        }

        // CS-101 (index 0) — 15 ta
        createStudentsBatch(groups, 0, new String[][]{
                {"cs101_aziz", "Azimov Aziz Bahodirovich"},
                {"cs101_dilshod", "Dilmurodov Dilshod Anvarovich"},
                {"cs101_jasur", "Jasurbek Toshmatov"},
                {"cs101_nodira", "Nodiraxon Karimova"},
                {"cs101_shaxzod", "Shaxzod Raxmatullayev"},
                {"cs101_zafar", "Zafarov Zafar Ilhomovich"},
                {"cs101_sardor", "Sardorov Sardor Ulug'bek o'g'li"},
                {"cs101_madina", "Madina Xolmatova"},
                {"cs101_otabek", "Otabekov Otabek Sherzod o'g'li"},
                {"cs101_gulnora", "Gulnora Saidova"},
                {"cs101_farrux", "Farrux Abdullayev"},
                {"cs101_nilufar", "Nilufar Tursunova"},
                {"cs101_bekzod", "Bekzod Mirzayev"},
                {"cs101_diyora", "Diyora Xasanova"},
                {"cs101_sanjar", "Sanjar Qodirov"},
        });

        // CS-102 (index 1) — 12 ta
        createStudentsBatch(groups, 1, new String[][]{
                {"cs102_javlon", "Javlonov Javlon Nurmatovich"},
                {"cs102_kamola", "Kamola Rajabova"},
                {"cs102_ulugbek", "Ulug'bek Xoliqulov"},
                {"cs102_malika", "Malika Toshpulatova"},
                {"cs102_behruz", "Behruz Ergashev"},
                {"cs102_sevara", "Sevara Murodova"},
                {"cs102_dostonbek", "Dostonbek Turayev"},
                {"cs102_mohira", "Mohira Usmonova"},
                {"cs102_elyor", "Elyor Kamolov"},
                {"cs102_lobar", "Lobar Nazarova"},
                {"cs102_abbos", "Abbos Sultonov"},
                {"cs102_zilola", "Zilola Xaydarova"},
        });

        // IT-101 (index 8) — 15 ta
        createStudentsBatch(groups, 8, new String[][]{
                {"it101_alisher", "Alisher Navro'zov"},
                {"it101_dilfuza", "Dilfuza Rahimova"},
                {"it101_rustam", "Rustam Qoraboyev"},
                {"it101_feruza", "Feruza Ismoilova"},
                {"it101_jamshid", "Jamshid Axmedov"},
                {"it101_maftuna", "Maftuna Botirova"},
                {"it101_nodir", "Nodir Yuldashev"},
                {"it101_shahnoza", "Shahnoza Olimova"},
                {"it101_ibrohim", "Ibrohim Temirov"},
                {"it101_zarina", "Zarina Umarova"},
                {"it101_sherzod", "Sherzod Qosimov"},
                {"it101_hilola", "Hilola Mirzayeva"},
                {"it101_oybek", "Oybek Salimov"},
                {"it101_barno", "Barno Eshmatova"},
                {"it101_tohir", "Tohir Jurayev"},
        });

        // IT-102 (index 9) — 10 ta
        createStudentsBatch(groups, 9, new String[][]{
                {"it102_laziz", "Laziz Mahmudov"},
                {"it102_nasiba", "Nasiba Ergasheva"},
                {"it102_firdavs", "Firdavs Xo'jayev"},
                {"it102_yulduz", "Yulduz Sobirov"},
                {"it102_shuhrat", "Shuhrat Raximov"},
                {"it102_munira", "Munira Azimova"},
                {"it102_humoyun", "Humoyun Sodiqov"},
                {"it102_mohigul", "Mohigul Xasanova"},
                {"it102_azizbek", "Azizbek Po'latov"},
                {"it102_shahlo", "Shahlo Toshboyeva"},
        });

        // SE-101 (index 16) — 15 ta
        createStudentsBatch(groups, 16, new String[][]{
                {"se101_doniyor", "Doniyor Karimov"},
                {"se101_dilnoza", "Dilnoza Jumayeva"},
                {"se101_asror", "Asror Xudoyberdiyev"},
                {"se101_nafisa", "Nafisa Qo'chqorova"},
                {"se101_bobur", "Bobur Usmanov"},
                {"se101_iroda", "Iroda Choriyeva"},
                {"se101_asilbek", "Asilbek Turg'unov"},
                {"se101_fotima", "Fotima Saidmurodova"},
                {"se101_xurshid", "Xurshid Yodgorov"},
                {"se101_ozoda", "Ozoda Mirkomilova"},
                {"se101_ravshan", "Ravshan Ro'ziboyev"},
                {"se101_zulfiya", "Zulfiya Eshqobilova"},
                {"se101_mirzo", "Mirzo Haydarov"},
                {"se101_saodat", "Saodat Nematova"},
                {"se101_komil", "Komil Abdurashidov"},
        });

        // AI-101 (index 22) — 10 ta
        createStudentsBatch(groups, 22, new String[][]{
                {"ai101_islom", "Islom Botirov"},
                {"ai101_nargiza", "Nargiza Xo'jayeva"},
                {"ai101_temur", "Temur Nurmatov"},
                {"ai101_gulbahor", "Gulbahor Rahmatova"},
                {"ai101_akmal", "Akmal Toshpulatov"},
                {"ai101_zuhra", "Zuhra Ergasheva"},
                {"ai101_sarvar", "Sarvar Choriyev"},
                {"ai101_manzura", "Manzura Boymurodova"},
                {"ai101_ulmas", "Ulmas Xudoyberganov"},
                {"ai101_robiya", "Robiya Mirzaqulova"},
        });

        // DS-101 (index 26) — 10 ta
        createStudentsBatch(groups, 26, new String[][]{
                {"ds101_shohrux", "Shohrux Baxtiyorov"},
                {"ds101_gavhar", "Gavhar Tursunova"},
                {"ds101_mansur", "Mansur Iskandarov"},
                {"ds101_lola", "Lola Qo'ldosheva"},
                {"ds101_abdullo", "Abdullo Xasanov"},
                {"ds101_sevinch", "Sevinch Karimova"},
                {"ds101_sanjar2", "Sanjar Olimov"},
                {"ds101_muxlisa", "Muxlisa Nurmatova"},
                {"ds101_baxrom", "Baxrom Saidov"},
                {"ds101_hulkar", "Hulkar Rashidova"},
        });

        // CY-101 (index 28) — 10 ta
        createStudentsBatch(groups, 28, new String[][]{
                {"cy101_jaxongir", "Jaxongir Tojiboyev"},
                {"cy101_muxabbat", "Muxabbat Yunusova"},
                {"cy101_husan", "Husan Ergashev"},
                {"cy101_durdona", "Durdona Mamatova"},
                {"cy101_anvar", "Anvar Salimov"},
                {"cy101_sabohat", "Sabohat Xolmatova"},
                {"cy101_nurillo", "Nurillo Abdullayev"},
                {"cy101_oydin", "Oydin Rahmonova"},
                {"cy101_mirkomil", "Mirkomil Usarov"},
                {"cy101_umida", "Umida Tashpulatova"},
        });

        System.out.println("✅ " + studentRepo.count() + " ta talaba yaratildi");
    }

    private void createStudentsBatch(List<Groups> groups, int groupIndex, String[][] students) {
        Groups group = groupIndex < groups.size() ? groups.get(groupIndex) : null;
        for (String[] s : students) {
            if (studentRepo.findByLogin(s[0]).isEmpty()) {
                studentRepo.save(Student.builder()
                        .login(s[0])
                        .fullName(s[1])
                        .password(passwordEncoder.encode("12345678"))
                        .groups(group)
                        .createAt(LocalDate.now())
                        .build());
            }
        }
    }
}