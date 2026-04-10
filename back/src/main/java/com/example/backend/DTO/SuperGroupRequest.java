package com.example.backend.DTO;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SuperGroupRequest {
    private UUID mainGroupId;
    private List<UUID> subGroupIds;
}