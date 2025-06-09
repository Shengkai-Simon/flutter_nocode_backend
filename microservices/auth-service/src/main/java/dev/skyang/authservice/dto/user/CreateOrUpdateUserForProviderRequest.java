package dev.skyang.authservice.dto.user;

// Mirrored from user-service
public record CreateOrUpdateUserForProviderRequest(String email, String provider, String providerId) {}
