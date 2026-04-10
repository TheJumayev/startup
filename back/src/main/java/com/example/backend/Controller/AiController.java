package com.example.backend.Controller;

import com.example.backend.Entity.Student;
import com.example.backend.Repository.StudentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final StudentRepo studentRepo;

    @GetMapping("/generate-certificates/{groupId}")
    public ResponseEntity<byte[]> generateCertificates(@PathVariable UUID groupId) throws Exception {

        List<Student> students = studentRepo.findByGroupId(groupId);

        ByteArrayOutputStream zipBaos = new ByteArrayOutputStream();
        ZipOutputStream zipOut = new ZipOutputStream(zipBaos);

        // TEMPLATE
        BufferedImage template = ImageIO.read(
                new File("C:/Users/user/Downloads/temp.png")
        );

        for (Student student : students) {

            BufferedImage image = new BufferedImage(
                    template.getWidth(),
                    template.getHeight(),
                    template.getType()
            );

            Graphics2D g = image.createGraphics();
            g.drawImage(template, 0, 0, null);

            // 🔥 TEXT QUALITY
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,
                    RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            String fullName = student.getFullName().toUpperCase();

            Font font = new Font("Serif", Font.BOLD, 52);
            g.setFont(font);
            g.setColor(new Color(30, 30, 30));

            FontMetrics fm = g.getFontMetrics();

// 🔥 SPLIT
            String[] words = fullName.split(" ");
            String line1 = "";
            String line2 = "";

            int bestSplit = words.length / 2;

// balansli bo‘lishi uchun optimal split
            int minDiff = Integer.MAX_VALUE;

            for (int i = 1; i < words.length; i++) {
                String l1 = String.join(" ", java.util.Arrays.copyOfRange(words, 0, i));
                String l2 = String.join(" ", java.util.Arrays.copyOfRange(words, i, words.length));

                int diff = Math.abs(fm.stringWidth(l1) - fm.stringWidth(l2));

                if (diff < minDiff) {
                    minDiff = diff;
                    bestSplit = i;
                }
            }

            line1 = String.join(" ", java.util.Arrays.copyOfRange(words, 0, bestSplit));
            line2 = String.join(" ", java.util.Arrays.copyOfRange(words, bestSplit, words.length));

// 🔥 POSITION (ENG MUHIM)
            int x = 340;

// 🔥 Y — BIROZ YUQORIGA KO‘TARAMIZ
            int y = 380;

// 🔥 LINE HEIGHT — KICHIK QILAMIZ
            int lineHeight = fm.getHeight() - 5;

// 🔥 DRAW
            g.drawString(line1, x, y);

            if (!line2.isEmpty()) {
                g.drawString(line2, x, y + lineHeight);
            }

            g.dispose();

            // 🔥 IMAGE → BYTE
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);

            // 🔥 ZIP
            String fileName = fullName.replaceAll("[^a-zA-Z0-9]", "_");

            ZipEntry entry = new ZipEntry(fileName + ".png");
            zipOut.putNextEntry(entry);
            zipOut.write(baos.toByteArray());
            zipOut.closeEntry();
        }

        zipOut.close();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=certificates.zip")
                .header("Content-Type", "application/zip")
                .body(zipBaos.toByteArray());
    }
}