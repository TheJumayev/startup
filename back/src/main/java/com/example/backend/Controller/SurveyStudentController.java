package com.example.backend.Controller;

import com.example.backend.Entity.SurveyStudent;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.Teacher;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.TeacherRepo;
import com.example.backend.Repository.SurveyStudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/survey-student")
@RequiredArgsConstructor
public class SurveyStudentController {

    private final SurveyStudentRepo surveyStudentRepo;
    private final StudentRepo studentRepo;
    private final TeacherRepo teacherRepo;

    // 🔹 1. Get one student's survey (for checking if submitted)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getSurveyByStudent(@PathVariable UUID studentId) {
        Optional<SurveyStudent> surveyOpt = surveyStudentRepo.findByStudentId(studentId);
        if (surveyOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("exists", false));
        }

        SurveyStudent s = surveyOpt.get();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("exists", true);

        // 🔸 Teacher selections
        response.put("teacherQ1", s.getTeacherQ1() != null ? s.getTeacherQ1().getFullName() : null);
        response.put("teacherQ2", s.getTeacherQ2() != null ? s.getTeacherQ2().getFullName() : null);
        response.put("teacherQ3", s.getTeacherQ3() != null ? s.getTeacherQ3().getFullName() : null);
        response.put("teacherQ4", s.getTeacherQ4() != null ? s.getTeacherQ4().getFullName() : null);
        response.put("teacherQ5", s.getTeacherQ5() != null ? s.getTeacherQ5().getFullName() : null);
        response.put("teacherQ6", s.getTeacherQ6() != null ? s.getTeacherQ6().getFullName() : null);
        response.put("teacherQ7", s.getTeacherQ7() != null ? s.getTeacherQ7().getFullName() : null);

        // 🔸 Boolean answers
        response.put("answer1", s.getAnswer1());
        response.put("answer2", s.getAnswer2());
        response.put("answer3", s.getAnswer3());

        return ResponseEntity.ok(response);
    }

    // 🔹 2. Save Survey (only once per student)
    @PostMapping("/save")
    public ResponseEntity<?> saveSurvey(@RequestBody SurveyStudent survey) {
        if (survey.getStudent() == null) {
            return ResponseEntity.badRequest().body("❌ Talaba ma'lumotlari kiritilmadi");
        }

        Optional<Student> studentOpt = studentRepo.findById(survey.getStudent().getId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Talaba topilmadi");
        }

        // Prevent duplicates
        if (surveyStudentRepo.findByStudent(studentOpt.get()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("⚠️ Siz allaqachon so‘rovnomada qatnashgansiz!");
        }

        // Boolean validation
        if (survey.getAnswer1() == null || survey.getAnswer2() == null || survey.getAnswer3() == null) {
            return ResponseEntity.badRequest().body("❌ Barcha ha/yo‘q savollar to‘ldirilishi kerak!");
        }

        survey.setStudent(studentOpt.get());
        surveyStudentRepo.save(survey);

        return ResponseEntity.ok("✅ So‘rovnoma muvaffaqiyatli yuborildi!");
    }

    // 🔹 3. Get question list (Uzbek)
    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("teacherQuestions", List.of(
                "1. Qaysi o'qituvchining bilim darajasi dars berish sifatlari va maxoratini 'Yuqori' darajada deb baholaysiz",
                "2. Qaysi o'qituvchining dars berish sifati va maxoratini 'Quyi' darajada deb xisoblaysiz?",
                "3. Qaysi o'qituvchi mutaxasis-pedagog sifatida sizga namuna bo'la oladilar?",
                "4. Qaysi o'qituvchining muomila madaniyati sizga ma'qul emas?",
                "5. Qaysi o'qituvchi bilimingizni xolisona baholaydi?",
                "6. Qaysi o‘qituvchi talabalar fikrini qo‘llab-quvvatlaydi?",
                "7. Qaysi o'qituvchi bilimingizni noxolis baholaydi?"
        ));

        response.put("booleanQuestions", List.of(
                "1. Universitetda tashkil etilgan Reyting nazorat tizimi sizga ma'qul emasmi?",
                "2. Universitetda axborot tizimlarida foydalanish uchun berilgan imkoniyatlar sizni qoniqtiradimi?",
                "3. Universitetda tashkil etilgan o'quv jarayonlari va ma'naviy ma'rifiy ishlarining tashkil etilishi sizni qoniqtiradimi?"
        ));

        return ResponseEntity.ok(response);
    }
    // 🔹 5. Boolean answer statistics
    @GetMapping("/boolean-summary")
    public ResponseEntity<?> getBooleanSummary() {
        List<SurveyStudent> all = (List<SurveyStudent>) surveyStudentRepo.findAll();
        int total = all.size();

        if (total == 0) return ResponseEntity.ok(List.of());

        long yes1 = all.stream().filter(s -> Boolean.TRUE.equals(s.getAnswer1())).count();
        long yes2 = all.stream().filter(s -> Boolean.TRUE.equals(s.getAnswer2())).count();
        long yes3 = all.stream().filter(s -> Boolean.TRUE.equals(s.getAnswer3())).count();

        List<Map<String, Object>> result = new ArrayList<>();
        result.add(Map.of(
                "question", "1. Universitetda tashkil etilgan Reyting nazorat tizimi sizga ma'qul emasmi?",
                "percent", (yes1 * 100 / total),
                "yesCount", yes1,
                "total", total
        ));
        result.add(Map.of(
                "question", "2. Universitetda axborot tizimlarida foydalanish uchun berilgan imkoniyatlar sizni qoniqtiradimi?",
                "percent", (yes2 * 100 / total),
                "yesCount", yes2,
                "total", total
        ));
        result.add(Map.of(
                "question", "3. Universitetda tashkil etilgan o'quv jarayonlari va ma'naviy ma'rifiy ishlarining tashkil etilishi sizni qoniqtiradimi?",
                "percent", (yes3 * 100 / total),
                "yesCount", yes3,
                "total", total
        ));

        return ResponseEntity.ok(result);
    }


    // 🔹 4. Teacher statistics
    @GetMapping("/statistic")
    public ResponseEntity<?> getStatistics() {
        List<SurveyStudent> all = (List<SurveyStudent>) surveyStudentRepo.findAll();
        Map<String, Integer> countMap = new HashMap<>();

        for (SurveyStudent s : all) {
            List<Teacher> teachers = Arrays.asList(
                    s.getTeacherQ1(), s.getTeacherQ2(), s.getTeacherQ3(),
                    s.getTeacherQ4(), s.getTeacherQ5(), s.getTeacherQ6(), s.getTeacherQ7()
            );
            for (Teacher t : teachers) {
                if (t != null) {
                    countMap.put(t.getFullName(), countMap.getOrDefault(t.getFullName(), 0) + 1);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        countMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .forEach(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("teacherName", entry.getKey());
                    row.put("voteCount", entry.getValue());
                    result.add(row);
                });

        return ResponseEntity.ok(result);
    }

    // 🔹 6. Statistics by question (each teacher question separately)
    @GetMapping("/question-statistic")
    public ResponseEntity<?> getStatisticsByQuestion() {
        List<SurveyStudent> all = (List<SurveyStudent>) surveyStudentRepo.findAll();
        if (all.isEmpty()) return ResponseEntity.ok(List.of());

        // map of question index -> (teacher name -> count)
        Map<Integer, Map<String, Integer>> questionStats = new LinkedHashMap<>();

        // iterate through all responses
        for (SurveyStudent s : all) {
            List<Teacher> teachers = Arrays.asList(
                    s.getTeacherQ1(),
                    s.getTeacherQ2(),
                    s.getTeacherQ3(),
                    s.getTeacherQ4(),
                    s.getTeacherQ5(),
                    s.getTeacherQ6(),
                    s.getTeacherQ7()
            );

            for (int i = 0; i < teachers.size(); i++) {
                Teacher t = teachers.get(i);
                if (t != null) {
                    questionStats
                            .computeIfAbsent(i + 1, k -> new HashMap<>())
                            .merge(t.getFullName(), 1, Integer::sum);
                }
            }
        }

        // build final response
        List<Map<String, Object>> response = new ArrayList<>();

        for (Map.Entry<Integer, Map<String, Integer>> entry : questionStats.entrySet()) {
            int questionIndex = entry.getKey();
            Map<String, Integer> teacherCounts = entry.getValue();

            List<Map<String, Object>> teacherList = teacherCounts.entrySet()
                    .stream()
                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .map(e -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("teacherName", e.getKey());
                        m.put("count", e.getValue());
                        return m;
                    })
                    .toList();



            response.add(Map.of(
                    "questionNumber", questionIndex,
                    "questionText", switch (questionIndex) {
                        case 1 -> "1. Qaysi o'qituvchining bilim darajasi dars berish sifatlari va maxoratini 'Yuqori' darajada deb baholaysiz";
                        case 2 -> "2. Qaysi o'qituvchining dars berish sifati va maxoratini 'Quyi' darajada deb xisoblaysiz?";
                        case 3 -> "3. Qaysi o'qituvchi mutaxasis-pedagog sifatida sizga namuna bo'la oladilar?";
                        case 4 -> "4. Qaysi o'qituvchining muomila madaniyati sizga ma'qul emas?";
                        case 5 -> "5. Qaysi o'qituvchi biliminggizni xolisona baholaydi?";
                        case 6 -> "6. Qaysi o‘qituvchi talabalar fikrini qo‘llab-quvvatlaydi?";
                        case 7 -> "7. Qaysi o'qituvchi bilimingizni noxolis baholaydi?";
                        default -> "Savol " + questionIndex;
                    },
                    "results", teacherList
            ));
        }

        return ResponseEntity.ok(response);
    }

}
