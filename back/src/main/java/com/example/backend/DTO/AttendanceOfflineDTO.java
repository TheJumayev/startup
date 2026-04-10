package com.example.backend.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceOfflineDTO {

    private Integer isPresent;      // 1=bor, 2=yo‘q, 3=sababli, 0=belgilanmagan
    private String comment;
    private UUID groupId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
    private UUID studentId;         // kim belgilayapti (talaba)
    private UUID userId;            // yoki admin/o‘qituvchi
    private UUID attachmentId;      // sababli bo‘lsa hujjat
}
