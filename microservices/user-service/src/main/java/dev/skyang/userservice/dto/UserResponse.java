package dev.skyang.userservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object representing a user's public profile information.
 * This DTO excludes sensitive information like password hash or verification codes.
 *
 * @param id User's unique identifier.
 * @param email User's email address.
 * @param emailVerified Boolean flag indicating if the user's email has been verified.
 * @param googleId User's Google identifier, if linked.
 * @param appleId User's Apple identifier, if linked.
 * @param microsoftId User's Microsoft identifier, if linked.
 * @param createdAt Timestamp of when the user account was created.
 * @param updatedAt Timestamp of the last update to the user account.
 */
public record UserResponse(
    UUID id,
    String email,
    boolean emailVerified,
    String googleId,
    String appleId,
    String microsoftId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
