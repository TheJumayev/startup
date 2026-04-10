package com.example.backend.Services.FileReaderService;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;


@Service
public class FileService {

    public String extractText(MultipartFile file) {
        try {
            String name = file.getOriginalFilename();

            if (name.endsWith(".pdf")) {
                PDDocument doc = PDDocument.load(file.getInputStream());
                return new PDFTextStripper().getText(doc);
            }

            if (name.endsWith(".docx")) {
                XWPFDocument doc = new XWPFDocument(file.getInputStream());
                return doc.getParagraphs()
                        .stream()
                        .map(p -> p.getText())
                        .collect(Collectors.joining("\n"));
            }

            return new String(file.getBytes());

        } catch (Exception e) {
            throw new RuntimeException("Ошибка чтения файла");
        }
    }
}
