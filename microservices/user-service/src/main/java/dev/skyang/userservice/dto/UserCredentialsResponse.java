package dev.skyang.userservice.dto;

import java.util.UUID;

/**
 * Data Transfer Object for securely transferring essential user credentials internally,
 * typically from User Service to Auth Service. This DTO includes the password hash.
 *
 * @param id User's unique identifier.
 * @param email User's email address.
 * @param passwordHash User's hashed password. This should only be handled by trusted internal services.
 */
public record UserCredentialsResponse(UUID id, String email, String passwordHash) {}
