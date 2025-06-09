package dev.skyang.authservice.dto.user;

import java.util.UUID;

// This DTO mirrors the one in user-service
public record UserCredentialsResponse(UUID id, String email, String passwordHash) {}
