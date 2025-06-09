package dev.skyang.userservice.dto;

/**
 * Data Transfer Object used when creating or updating a user based on information
 * from a third-party OAuth provider.
 * If a user with the email exists, it links the provider. Otherwise, it creates a new user
 * and links the provider, marking the email as verified.
 *
 * @param email The email address associated with the user's account on the third-party provider.
 * @param provider The name of the third-party provider (e.g., "google", "apple", "microsoft").
 * @param providerId The user's unique identifier from that specific provider.
 */
public record CreateOrUpdateUserForProviderRequest(String email, String provider, String providerId) {}
