package dev.skyang.userservice.dto;

/**
 * Data Transfer Object for requesting the creation of a new user.
 * Contains the essential information needed to establish a new local user account.
 *
 * @param email The email address for the new user. Must be unique.
 * @param password The plain text password for the new user. This will be hashed by the User Service.
 */
public record CreateUserRequest(String email, String password) {}
