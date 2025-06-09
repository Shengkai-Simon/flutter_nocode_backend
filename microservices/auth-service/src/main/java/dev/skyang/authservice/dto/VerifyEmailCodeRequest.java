package dev.skyang.authservice.dto;

/**
 * Data Transfer Object for submitting an email verification code.
 * Used by clients to confirm ownership of an email address after registration.
 *
 * @param email The email address that is being verified.
 * @param verificationCode The verification code received by the user via email.
 */
public record VerifyEmailCodeRequest(String email, String verificationCode) {}
