package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "amaliyot_yuklamasi")
@Entity
@Builder
public class AmaliyotYuklamasi {
    // ✅ Faqat bitta ID bo‘lishi kerak!
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    // Asosiy bog‘lanishlar
    @ManyToOne
    private Months month;
    @ManyToOne
    private Student student;
    private LocalDateTime deadline;
    private Integer grade;

//    1 bo'lsa talaba yubormagan default
//    2 bo'lsa talaba yuborgan tasdiqlanmagan
//    3 bo'lsa tasdiqlangan
//    4 rad etildi

    // Kundalik
    @ManyToOne
    private Attachment kundalikFile;
    @ManyToOne
    private Attachment kundalikFileOld;
    private Integer kundalikStatus;
    private String kundalikDescription;
    private LocalDateTime kundalikUpdate;
    private LocalDateTime kundalikEndTime;

    // Kundalik 1
    @ManyToOne
    private Attachment kundalik1File;
    @ManyToOne
    private Attachment kundalik1FileOld;
    private Integer kundalik1Status;
    private String kundalik1Description;
    private LocalDateTime kundalik1Update;
    private LocalDateTime kundalikEndTime1;

    // Kundalik 2
    @ManyToOne
    private Attachment kundalik2File;
    @ManyToOne
    private Attachment kundalik2FileOld;
    private Integer kundalik2Status;
    private String kundalik2Description;
    private LocalDateTime kundalik2Update;
    private LocalDateTime kundalikEndTime2;

    // Kundalik 3
    @ManyToOne
    private Attachment kundalik3File;
    @ManyToOne
    private Attachment kundalik3FileOld;
    private Integer kundalik3Status;
    private String kundalik3Description;
    private LocalDateTime kundalik3Update;
    private LocalDateTime kundalikEndTime3;

    // Dars tahlili
    @ManyToOne
    private Attachment darsTahliliFile;
    @ManyToOne
    private Attachment darsTahliliFileOld;
    private Integer darsTahliliStatus;
    private String darsTahliliDescription;
    private LocalDateTime darsTahliliUpdate;

    // Dars ishlanmasi
    @ManyToOne
    private Attachment darsIshlanmasiFile;
    @ManyToOne
    private Attachment darsIshlanmasiFileOld;
    private Integer darsIshlanmasiStatus;
    private String darsIshlanmasiDescription;
    private LocalDateTime darsIshlanmasiUpdate;

    // Tarbiyaviy
    @ManyToOne
    private Attachment tarbiyaviyFile;
    @ManyToOne
    private Attachment tarbiyaviyFileOld;
    private Integer tarbiyaviyStatus;
    private String tarbiyaviyDescription;
    private LocalDateTime tarbiyaviyUpdate;

    // Sinf rahbar
    @ManyToOne
    private Attachment sinfRahbarFile;
    @ManyToOne
    private Attachment sinfRahbarFileOld;
    private Integer sinfRahbarStatus;
    private String sinfRahbarDescription;
    private LocalDateTime sinfRahbarUpdate;

    // Pedagogik
    @ManyToOne
    private Attachment pedagogikFile;
    @ManyToOne
    private Attachment pedagogikFileOld;
    private Integer pedagogikStatus;
    private String pedagogikDescription;
    private LocalDateTime pedagogikUpdate;

    // Tadbir
    @ManyToOne
    private Attachment tadbirFile;
    @ManyToOne
    private Attachment tadbirFileOld;
    private Integer tadbirStatus;
    private String tadbirDescription;
    private LocalDateTime tadbirUpdate;

    // Foto
    @ManyToOne
    private Attachment photoFile;
    @ManyToOne
    private Attachment photoFileOld;
    private Integer photoStatus;
    private String photoDescription;
    private LocalDateTime photoUpdate;

    // Hisobot
    @ManyToOne
    private Attachment hisobotFile;
    @ManyToOne
    private Attachment hisobotFileOld;
    private Integer hisobotStatus;
    private String hisobotDescription;
    private LocalDateTime hisobotUpdate;
}
