package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.CertificateRepo;
import com.example.backend.Repository.MustaqilTalimStudentRepo;
import com.example.backend.Repository.StudentRepo;
import com.example.backend.Repository.StudentSubjectRepo;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

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
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@CrossOrigin
@RestController
@RequestMapping("/api/v1/mustaqil-talim-certificate")
@RequiredArgsConstructor
public class MustaqilTalimCertificateController {

  private final MustaqilTalimStudentRepo mustaqilTalimStudentRepo;





  @GetMapping("/certificate/{groupId}/{curriculumSubjectId}/{studentId}")
    public ResponseEntity<?> getCertificateFile(
                @PathVariable UUID groupId,
                @PathVariable UUID curriculumSubjectId,
                @PathVariable UUID studentId
) {


            Optional<MustaqilTalimStudent> opt =
                    mustaqilTalimStudentRepo.findByGroupAndCurriculumAndStudent(
                            groupId, curriculumSubjectId, studentId
                    );

            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Yakuniy hali topshirmagansiz!");
            }
        MustaqilTalimStudent cert = opt.get();
        Student st = cert.getStudent();
        CurriculumSubject subjectEntity = cert.getMustaqilExam().getCurriculumSubject();

        String fullName = safe(st != null ? extractFullName(st) : null, "F.I.O. noma’lum").toUpperCase();
        String subject = safe(subjectEntity.getSubject().getName(), "Fan nomi");
        String ball = safe(cert.getBall(), "-");
        List<SubjectDetails> subjectDetails = subjectEntity.getSubjectDetails();

        Integer acload = 0;
        for (SubjectDetails subjectDetail : subjectDetails) {
            if(subjectDetail.getTrainingCode().equals("17")){
                acload=subjectDetail.getAcademic_load();
            }
        }
        try {
            // 1) Template from Desktop/temp_photo.png
//            Path templatePath = Paths.get(System.getProperty("user.home"), "Desktop", "mustaqil_talim.png");
            Path baseDir = Paths.get(".").toAbsolutePath().normalize();
            Path templatePath = baseDir.resolve("mustaqil_talim.png");
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
                    int logoX = (int) (W * 0.44);
                    int logoY = (int) (H * 0.08);

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
            int titleMarginTop = (int) (H * 0.18); // margin-top (6%)

            g.setColor(navy);
            drawCentered(
                    g,
                    "SERTIFIKAT",
                    centerX,
                    (int) (H * 0.20) + titleMarginTop,
                    titleFont
            );


            // Full name
            g.setColor(navy);
            drawCentered(g, fullName, centerX, (int) (H * 0.45), nameFont);

            // Platform
            g.setColor(gray);
            drawCentered(g, "edu.bxu.uz platformasida 2025-2026 o'quv yilining bahorgi semestridagi", centerX, (int) (H * 0.5), bodyFont);

            // Subject
            g.setColor(navy);
            drawCentered(g, subject, centerX, (int) (H * 0.55), subjFont);

            // Middle line
            g.setColor(gray);
            String text = "fani bo'yicha ajratilgan mustaqil ta'limni";
            drawCentered(g, text, centerX, (int) (H * 0.6), bodyFont);

            // 5) ONE-LINE: "<ball> ballga o'zlashtirdi" (centered as a single line)
            String rightText = "ballga o'zlashtirdi";
            int yBallLine = (int) (H * 0.68);
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
//            drawRight(g, "Sertifikat raqami: " + numberStr, (int) (W * 0.60), (int) (H * 0.90), footFont);

            // 7) QR (optional) – keep your current behavior
            try {
                String verifyUrl = "https://edu.bxu.uz/mustaqil-talim/certificate/file/" + groupId + "/" + curriculumSubjectId + "/" + studentId;
                int qrSize = (int) (W * 0.12);
                int margin = (int) (W * 0.07);
                int qrX = W - qrSize - margin - 200;
                int qrY = H - qrSize - margin + 20;

                drawQr(g, verifyUrl, qrX, qrY, qrSize);

                // red border around QR
                g.setStroke(new BasicStroke(6f));
                g.setColor(new Color(200, 0, 0));
                g.drawRect(qrX - 10, qrY - 10, qrSize + 10, qrSize + 10);
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
                            .filename("certificate.png")
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
