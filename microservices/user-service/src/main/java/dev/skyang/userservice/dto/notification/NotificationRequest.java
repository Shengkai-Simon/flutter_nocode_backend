package dev.skyang.userservice.dto.notification;

public record NotificationRequest(String to, String subject, String body) {}
