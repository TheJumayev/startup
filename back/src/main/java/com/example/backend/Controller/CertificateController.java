package com.example.backend.Controller;

import com.example.backend.Entity.Certificate;
import com.example.backend.Entity.Student;
import com.example.backend.Entity.StudentSubject;
import com.example.backend.Repository.CertificateRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.StudentSubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;


@CrossOrigin
@RestController
@RequestMapping("/api/v1/certificate")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateRepo certificateRepo;
    private final StudentRepo studentRepo;
    private final StudentSubjectRepo studentSubjectRepo;


    @GetMapping
    public HttpEntity<?> getCertificate() {
        return new ResponseEntity<>(certificateRepo.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{studentId}/{subjectId}")
    public HttpEntity<?> getCertificate(@PathVariable UUID studentId, @PathVariable UUID subjectId) {
        Optional<Certificate> certificate = certificateRepo.findByStudentIdAndSubjectId(studentId, subjectId);
        if (certificate.isPresent()) {
            return new ResponseEntity<>(certificate.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{studentId}/{subjectId}/{ball}")
    public HttpEntity<?> addCertificate(
            @PathVariable UUID studentId,
            @PathVariable UUID subjectId,
            @PathVariable String ball
    ) {
        Optional<Student> byId = studentRepo.findById(studentId);
        Optional<StudentSubject> bySubjectId = studentSubjectRepo.findById(subjectId);

        if (byId.isEmpty() || bySubjectId.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Oxirgi berilgan number’ni topamiz (eng kattasi)
        int last = certificateRepo.findTopByOrderByNumberDesc()
                .map(Certificate::getNumber)
                .orElse(999); // hali hech narsa bo‘lmasa, 999 dan boshlaymiz

        int next = last + 1;

        // Diapazon nazorati: 1000..10000
        if (next < 1000) next = 1000;
        if (next > 10000) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Certificate number pool exhausted (1000..10000).");
        }

        Certificate certificate = new Certificate(byId.get(), bySubjectId.get(), LocalDateTime.now(), ball);
        certificate.setNumber(next);

        // Ehtiyot uchun: unique constraint bor, lekin parallel so‘rov bo‘lsa conflict bo‘lishi mumkin.
        // Bunday holatda Database unique violation chiqsa, 409 qaytarish ma’qul (global exception handler’da ham ushlasa bo‘ladi).
        Certificate saved = certificateRepo.save(certificate);

        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @PutMapping("/{certificateId}/ball/{ball}")
    public ResponseEntity<?> updateCertificateBall(@PathVariable UUID certificateId,
                                                   @PathVariable String ball) {
        Optional<Certificate> opt = certificateRepo.findById(certificateId);
        if (opt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Certificate cert = opt.get();
        cert.setBall(ball); // ✅ меняем только ball
        cert.setCreated(LocalDateTime.now()); // если нужно фиксировать время изменения

        Certificate saved = certificateRepo.save(cert);
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/file/{certificateId}")
    public ResponseEntity<?> getCertificateFile(@PathVariable UUID certificateId) {
        Optional<Certificate> opt = certificateRepo.findById(certificateId);
        if (opt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Certificate cert = opt.get();
        Student st = cert.getStudent();
        StudentSubject ss = cert.getStudentSubject();

        String fullName = safe(st != null ? extractFullName(st) : null, "F.I.O. noma’lum").toUpperCase();
        String subject = safe(extractSubjectName(ss), "Fan nomi");
        String ball = safe(cert.getBall(), "-");
        String numberStr = cert.getNumber() != null ? cert.getNumber().toString() : "";

        String acload = cert.getStudentSubject().getTotalAcload().toString();
        try {
            // 1) Template from Desktop/temp_photo.png
//            Path templatePath = Paths.get(System.getProperty("user.home"), "Desktop", "temp_photo.png");
            Path baseDir = Paths.get(".").toAbsolutePath().normalize();
            Path templatePath = baseDir.resolve("temp_photo.png");
//             if (!Files.exists(templatePath)) {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                        .body("Template not found: " + templatePath.toAbsolutePath());
//            }
            if (!Files.exists(templatePath)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Template not found: " + templatePath.toAbsolutePath());
            }

            BufferedImage template = ImageIO.read(templatePath.toFile());

            int W = template.getWidth();
            int H = template.getHeight();

            // 2) Canvas
            BufferedImage out = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = out.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            g.drawImage(template, 0, 0, null);

            // 3) LOGO (Desktop/logo.jpg) — keep your current placement
            try {
//                Path logoPath = Paths.get(System.getProperty("user.home"), "Desktop", "logo.jpg");
                Path logoPath = baseDir.resolve("logo.jpg");
                if (Files.exists(logoPath)) {
                    BufferedImage logo = ImageIO.read(logoPath.toFile());
                    int desiredW = (int) (W * 0.12);
                    int desiredH = (int) (logo.getHeight() * (desiredW / (double) logo.getWidth()));
                    int logoX = (W - desiredW) / 5 + 50;
                    int logoY = (int) (H * 0.74);
                    g.drawImage(logo, logoX, logoY, desiredW, desiredH, null);
                }
            } catch (Exception ignore) { /* continue without logo */ }

            // 4) Fonts & colors
            Font titleFont = loadFontOrDefault(null, (int) (H * 0.105), Font.BOLD);
            Font nameFont = loadFontOrDefault(null, (int) (H * 0.055), Font.BOLD);
            Font bodyFont = loadFontOrDefault(null, (int) (H * 0.035), Font.PLAIN);
            Font subjFont = loadFontOrDefault(null, (int) (H * 0.040), Font.BOLD);
            Font ballFont = loadFontOrDefault(null, (int) (H * 0.075), Font.BOLD);
            Font footFont = loadFontOrDefault(null, (int) (H * 0.028), Font.PLAIN);

            Color navy = new Color(48, 60, 92);
            Color gray = new Color(60, 60, 60);

            int centerX = W / 2;

            // (Optional) Title if needed
            // g.setColor(navy);
            // drawCentered(g, "SERTIFIKAT", centerX, (int) (H * 0.20), titleFont);

            // Full name
            g.setColor(navy);
            drawCentered(g, fullName, centerX, (int) (H * 0.30), nameFont);

            // Platform
            g.setColor(gray);
            drawCentered(g, "edu.bxu.uz masofaviy ta'lim platformasida", centerX, (int) (H * 0.38), bodyFont);

            // Subject
            g.setColor(navy);
            drawCentered(g, subject, centerX, (int) (H * 0.44), subjFont);

            // Middle line
            g.setColor(gray);
            String text = "fanidan " + acload + " soatga mo‘ljallangan masofaviy kursni";
            drawCentered(g, text, centerX, (int) (H * 0.50), bodyFont);

            // 5) ONE-LINE: "<ball> ballga o'zlashtirdi" (centered as a single line)
            String rightText = "ballga o'zlashtirdi";
            int yBallLine = (int) (H * 0.60);
            int gapPx = Math.max(8, (int) (H * 0.01));

            // measure left part (ball) with ballFont
            g.setFont(ballFont);
            FontMetrics fmL = g.getFontMetrics();
            int wL = fmL.stringWidth(ball);

            // measure right part with bodyFont
            g.setFont(bodyFont);
            FontMetrics fmR = g.getFontMetrics();
            int wR = fmR.stringWidth(rightText);

            int total = wL + gapPx + wR;
            int startX = centerX - total / 2;

            // draw left (ball) in red
            g.setFont(ballFont);
            g.setColor(new Color(194, 39, 45));
            g.drawString(ball, startX, yBallLine);

            // draw right (phrase) in gray
            int rightX = startX + wL + gapPx;
            g.setFont(bodyFont);
            g.setColor(gray);
            g.drawString(rightText, rightX, yBallLine);

            // 6) Certificate number (bottom-right)
            g.setColor(navy);
            drawRight(g, "Sertifikat raqami: " + numberStr, (int) (W * 0.60), (int) (H * 0.90), footFont);

            // 7) QR (optional) – keep your current behavior
            try {
                String verifyUrl = "https://edu.bxu.uz/certificate/file/" + cert.getId();
                int qrSize = (int) (W * 0.12);
                int margin = (int) (W * 0.07);
                int qrX = W - qrSize - margin - 450;
                int qrY = H - qrSize - margin + 20;

                drawQr(g, verifyUrl, qrX, qrY, qrSize);

                // red border around QR
                g.setStroke(new BasicStroke(6f));
                g.setColor(new Color(200, 0, 0));
                g.drawRect(qrX - 8, qrY - 8, qrSize + 12, qrSize + 12);
            } catch (NoClassDefFoundError | Exception ignore) {
                // ZXing missing or error — continue without QR
            }

            g.dispose();

            // 8) PNG response
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(out, "png", baos);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename("certificate_" + numberStr + ".png")
                            .build()
            );
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("PNG generatsiyada xatolik: " + e.getMessage());
        }
    }

// --------- HELPERS ---------

    private static String safe(Object o, String def) {
        return (o == null) ? def : String.valueOf(o).trim();
    }

    // Student dan F.I.O. chiqarish (o‘zingizga moslang)
    private static String extractFullName(Student s) {
        try {
            // agar sizda s.getFullName() bo‘lsa:
            java.lang.reflect.Method m = s.getClass().getMethod("getFullName");
            Object v = m.invoke(s);
            if (v != null) return v.toString();
        } catch (Exception ignored) {
        }
        // fallback: First + Second + Third
        String f = getIfExists(s, "getFirstName");
        String m = getIfExists(s, "getMiddleName");
        String l = getIfExists(s, "getLastName");
        return String.join(" ", Arrays.stream(new String[]{l, f, m}).filter(x -> x != null && !x.isBlank()).toList());
    }

    private static String extractSubjectName(StudentSubject ss) {
        if (ss == null) return null;
        // Agar StudentSubject’da getName() bo‘lsa:
        String direct = getIfExists(ss, "getName");
        if (direct != null) return direct;
        // Yoki ichida Subject bo‘lishi mumkin:
        try {
            java.lang.reflect.Method subjM = ss.getClass().getMethod("getSubject");
            Object subj = subjM.invoke(ss);
            if (subj != null) {
                String n = getIfExists(subj, "getName");
                if (n != null) return n;
                return subj.toString();
            }
        } catch (Exception ignored) {
        }
        return ss.toString();
    }

    private static String getIfExists(Object obj, String getter) {
        try {
            java.lang.reflect.Method m = obj.getClass().getMethod(getter);
            Object v = m.invoke(obj);
            return v == null ? null : v.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private static Font loadFontOrDefault(InputStream fontStream, int size, int style) {
        try {
            if (fontStream != null) {
                Font base = Font.createFont(Font.TRUETYPE_FONT, fontStream);
                return base.deriveFont(style, (float) size);
            }
        } catch (Exception ignored) {
        }
        return new Font("SansSerif", style, size);
    }

    private static void drawCentered(Graphics2D g, String text, int centerX, int y, Font font) {
        g.setFont(font);
        FontMetrics fm = g.getFontMetrics();
        int x = centerX - fm.stringWidth(text) / 2;
        g.drawString(text, x, y);
    }

    private static void drawRight(Graphics2D g, String text, int rightX, int y, Font font) {
        g.setFont(font);
        FontMetrics fm = g.getFontMetrics();
        int x = rightX - fm.stringWidth(text);
        g.drawString(text, x, y);
    }

    // (ixtiyoriy) QR chizish
    private static void drawQr(Graphics2D g, String text, int x, int y, int size) throws WriterException {
        QRCodeWriter qr = new QRCodeWriter();
        BitMatrix m = qr.encode(text, BarcodeFormat.QR_CODE, size, size);
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                g.setColor(m.get(i, j) ? Color.BLACK : new Color(0, 0, 0, 0));
                g.fillRect(x + i, y + j, 1, 1);
            }
        }
    }


}
