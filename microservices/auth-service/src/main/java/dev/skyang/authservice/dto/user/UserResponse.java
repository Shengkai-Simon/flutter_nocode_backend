package dev.skyang.authservice.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

// Mirrored from user-service
public record UserResponse(
    UUID id, String email, boolean emailVerified,
    String googleId, String appleId, String microsoftId,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
