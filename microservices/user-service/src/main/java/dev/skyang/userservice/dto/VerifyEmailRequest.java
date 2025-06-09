package dev.skyang.userservice.dto;

/**
 * Data Transfer Object for verifying a user's email address.
 *
 * @param email The email address of the user attempting verification.
 * @param verificationCode The verification code provided by the user.
 */
public record VerifyEmailRequest(String email, String verificationCode) {}
