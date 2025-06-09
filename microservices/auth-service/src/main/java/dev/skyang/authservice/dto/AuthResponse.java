package dev.skyang.authservice.dto;

/**
 * Data Transfer Object for returning authentication tokens to the client.
 * This DTO is typically used by the Spring Authorization Server's token endpoint (`/oauth2/token`)
 * when issuing JWTs or other token types.
 *
 * @param accessToken The access token (e.g., JWT) for authenticating API requests.
 * @param tokenType The type of the token (e.g., "Bearer").
 * @param expiresIn The duration in seconds for which the access token is valid.
 *                  This field might not always be present or could be handled differently
 *                  (e.g., included within the JWT claims directly).
 */
public record AuthResponse(String accessToken, String tokenType, Long expiresIn) {}
