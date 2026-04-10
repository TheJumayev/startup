package com.example.backend.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class UploadedFile {

    @Id
    @GeneratedValue
    private UUID id;

    private String fileName;
    private String fileType;
    private String filePath;

    @ManyToOne
    private User teacher;
}
