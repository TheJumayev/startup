package com.example.backend.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AmaliyotYuklamasiDTO {
    private UUID monthId;
    private UUID studentId;
    private UUID kundalik;
    private Integer kundalikStatus;
    private String kundalikDescription;
    private UUID kundalik1;
    private Integer kundalik1Status;
    private String kundalik1Description;
    private UUID kundalik2;
    private Integer kundalik2Status;
    private String kundalik2Description;
    private UUID kundalik3;
    private Integer kundalik3Status;
    private String kundalik3Description;
    private UUID darsTahlili;
    private Integer darsTahliliStatus;
    private String darsTahliliDescription;
    private UUID darsIshlanmasi;
    private Integer darsIshlanmasiStatus;
    private String darsIshlanmasiDescription;
    private UUID tarbiyaviy;
    private Integer tarbiyaviyStatus;
    private String tarbiyaviyDescription;
    private UUID sinfRahbar;
    private Integer sinfRahbarStatus;
    private String sinfRahbarDescription;
    private UUID pedagogik;
    private Integer pedagogikStatus;
    private String pedagogikDescription;
    private UUID tadbir;
    private Integer tadbirStatus;
    private String tadbirDescription;
    private UUID photo;
    private Integer photoStatus;
    private String photoDescription;
    private UUID hisobot;
    private Integer hisobotStatus;
    private String hisobotDescription;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime kundalikEndTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime kundalikEndTime1;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime kundalikEndTime2;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime kundalikEndTime3;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime deadline;
}
