package dev.skyang.authservice.dto;

/**
 * Data Transfer Object for user registration requests.
 * It captures the necessary information from a user wishing to create a new account.
 *
 * @param email The email address provided by the user for registration.
 *              This will be used as the primary identifier for the account.
 * @param password The plain text password provided by the user.
 *                 The `auth-service` will pass this to the `user-service`,
 *                 which is responsible for hashing it securely before storage.
 */
public record RegistrationRequest(String email, String password) {}
