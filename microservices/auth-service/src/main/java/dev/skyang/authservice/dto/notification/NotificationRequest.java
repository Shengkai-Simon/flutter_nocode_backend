package dev.skyang.authservice.dto.notification;

// Mirrored from notification-service (assumption)
public record NotificationRequest(String to, String subject, String body) {}
