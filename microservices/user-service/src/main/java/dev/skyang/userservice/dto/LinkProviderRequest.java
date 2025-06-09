package dev.skyang.userservice.dto;

/**
 * Data Transfer Object for linking a third-party OAuth provider to an existing user account.
 *
 * @param provider The name of the third-party provider (e.g., "google", "apple", "microsoft").
 * @param providerId The user's unique identifier from that specific provider.
 */
public record LinkProviderRequest(String provider, String providerId) {}
