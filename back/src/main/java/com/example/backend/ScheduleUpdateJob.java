package com.example.backend;

import com.example.backend.Controller.ScheduleListController;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class ScheduleUpdateJob {

    private final ScheduleListController scheduleListController;

    @PostConstruct
    public void init() {
        System.out.println("✅ ScheduleUpdateJob bean CREATED");
    }

    @Scheduled(cron = "0 0 2 * * *", zone = "UTC")
//    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Tashkent")
    public void updateEveryMorning() {
        System.out.println("⏰ 02:00 UTC — Schedule update started");
        scheduleListController.updateScheduleList();
    }
}
