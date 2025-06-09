package dev.skyang.authservice.dto;

/**
 * Data Transfer Object for local username/password login attempts.
 * Note: The `/auth/login` endpoint using this DTO is currently a placeholder.
 * For actual password-based login, clients should use the OAuth2 token endpoint
 * (`/oauth2/token`) with `grant_type=password`.
 *
 * @param email The user's email address.
 * @param password The user's plain text password.
 */
public record LoginRequest(String email, String password) {}
