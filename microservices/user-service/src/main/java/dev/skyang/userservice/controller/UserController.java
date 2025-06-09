package dev.skyang.userservice.controller;

import dev.skyang.userservice.dto.*;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// Removed ResponseStatusException as GlobalExceptionHandler handles IllegalArgumentException
// import org.springframework.web.server.ResponseStatusException;

import dev.skyang.userservice.dto.UserCredentialsResponse;
import java.util.UUID;

/**
 * Controller for user management operations.
 * These endpoints are primarily intended for internal use by other microservices (e.g., AuthService)
 * and should be secured accordingly (e.g., network policies, client credentials for inter-service calls).
 * Direct public exposure of these endpoints is generally not recommended without an API Gateway
 * and appropriate security measures at the gateway level.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Creates a new user. This endpoint is typically called internally by AuthService during the registration flow.
     * Upon successful user creation, an email verification code is generated, and an email is dispatched
     * to the user via the NotificationService.
     *
     * @param request The request body containing the new user's email and password.
     * @return ResponseEntity containing {@link UserResponse} on successful creation (HTTP 201 Created),
     *         or an error status if user registration fails (e.g., HTTP 409 Conflict if email already exists,
     *         handled by {@link dev.skyang.userservice.exception.GlobalExceptionHandler}).
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        // IllegalArgumentException for email conflict is thrown by service, handled by GlobalExceptionHandler
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.mapToUserResponse(user));
    }

    /**
     * Verifies a user's email address using a provided verification code.
     * This endpoint is typically called internally by AuthService.
     *
     * @param request The request body containing the user's email and the verification code.
     * @return ResponseEntity with HTTP 200 OK if verification is successful.
     *         HTTP 400 Bad Request if the code is invalid, expired, or max attempts exceeded.
     *         HTTP 404 Not Found if the user email does not exist (handled by GlobalExceptionHandler from service).
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestBody VerifyEmailRequest request) {
        // IllegalArgumentException for user not found or max attempts is thrown by service, handled by GlobalExceptionHandler
        boolean verified = userService.verifyEmail(request);
        return verified ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    /**
     * Retrieves a user's public profile information by their email address.
     * This endpoint is typically called internally by AuthService or other trusted services.
     *
     * @param email The email address of the user to retrieve.
     * @return ResponseEntity containing {@link UserResponse} (HTTP 200 OK) if the user is found,
     *         or HTTP 404 Not Found if no user exists with that email (handled by GlobalExceptionHandler).
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return userService.findUserByEmail(email)
                .map(user -> ResponseEntity.ok(userService.mapToUserResponse(user)))
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    /**
     * Retrieves a user's public profile information by their third-party provider ID.
     * This endpoint is typically called internally by AuthService.
     *
     * @param provider The name of the third-party provider (e.g., "google", "apple", "microsoft").
     * @param providerId The user's unique ID from that provider.
     * @return ResponseEntity containing {@link UserResponse} (HTTP 200 OK) if the user is found,
     *         HTTP 404 Not Found if no user is linked to that provider ID (handled by GlobalExceptionHandler),
     *         or HTTP 400 Bad Request if the provider is unknown (handled by GlobalExceptionHandler).
     */
    @GetMapping("/provider/{provider}/{providerId}")
    public ResponseEntity<UserResponse> getUserByProviderId(@PathVariable String provider, @PathVariable String providerId) {
        // IllegalArgumentException for unknown provider or user not found is thrown by service, handled by GlobalExceptionHandler
        return userService.findUserByProviderId(provider, providerId)
            .map(user -> ResponseEntity.ok(userService.mapToUserResponse(user)))
            .orElseThrow(() -> new IllegalArgumentException("User not found for provider " + provider + " with ID " + providerId));
    }

    /**
     * Links a third-party provider account to an existing user.
     * This endpoint is typically called internally by AuthService.
     *
     * @param id The UUID of the user to link the provider to.
     * @param request The request body containing the provider's name and the provider-specific ID.
     * @return ResponseEntity containing the updated {@link UserResponse} (HTTP 200 OK),
     *         or an error status (e.g., HTTP 400 Bad Request for unknown provider,
     *         HTTP 404 Not Found for user ID not found - handled by GlobalExceptionHandler).
     */
    @PutMapping("/{id}/link-provider")
    public ResponseEntity<UserResponse> linkProvider(@PathVariable UUID id, @RequestBody LinkProviderRequest request) {
        // IllegalArgumentException for user not found or unknown provider is thrown by service, handled by GlobalExceptionHandler
        User user = userService.linkProviderToUser(id, request);
        return ResponseEntity.ok(userService.mapToUserResponse(user));
    }

    /**
     * Creates a new user or updates an existing user based on information from a third-party provider.
     * If a user with the given email exists, their account is linked/updated with the provider ID.
     * If no user with the email exists, a new user is created. Email is automatically marked as verified.
     * This endpoint is typically called internally by AuthService after a successful third-party login.
     *
     * @param request The request body containing the user's email, provider name, and provider-specific ID.
     * @return ResponseEntity containing the created or updated {@link UserResponse} (HTTP 200 OK),
     *         or HTTP 400 Bad Request for unknown provider (handled by GlobalExceptionHandler).
     */
    @PostMapping("/provider-user")
    public ResponseEntity<UserResponse> createOrUpdateUserFromProvider(@RequestBody CreateOrUpdateUserForProviderRequest request) {
        // IllegalArgumentException for unknown provider is thrown by service, handled by GlobalExceptionHandler
        User user = userService.createOrUpdateUserForProvider(request.email(), request.provider(), request.providerId());
        return ResponseEntity.ok(userService.mapToUserResponse(user));
    }

    /**
     * Fetches user credentials (ID, email, and password hash) by email.
     * WARNING: This endpoint is strictly for internal system use by AuthService and MUST BE SECURED
     * appropriately (e.g., via network policies, mTLS, or client credential flow between services).
     * Exposing this endpoint publicly would be a severe security risk.
     *
     * @param email The user's email address.
     * @return ResponseEntity containing {@link UserCredentialsResponse} (HTTP 200 OK) if found,
     *         or HTTP 404 Not Found if no user exists with that email (handled by GlobalExceptionHandler).
     */
    @GetMapping("/email/{email}/credentials")
    public ResponseEntity<UserCredentialsResponse> getUserCredentials(@PathVariable String email) {
        return userService.getUserCredentialsByEmail(email)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new IllegalArgumentException("Credentials not found for user with email: " + email));
    }
}
