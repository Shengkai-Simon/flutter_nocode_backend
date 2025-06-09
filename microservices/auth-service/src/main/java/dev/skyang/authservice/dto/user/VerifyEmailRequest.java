package dev.skyang.authservice.dto.user;

// Mirrored from user-service
public record VerifyEmailRequest(String email, String verificationCode) {}
