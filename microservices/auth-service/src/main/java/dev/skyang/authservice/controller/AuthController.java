package dev.skyang.authservice.controller;

import dev.skyang.authservice.client.UserServiceClient;
import dev.skyang.authservice.dto.*;
import dev.skyang.authservice.dto.user.CreateUserRequest;
import dev.skyang.authservice.dto.user.UserResponse;
import dev.skyang.authservice.dto.user.VerifyEmailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

/**
 * Controller for handling user authentication processes such as registration,
 * email verification, and placeholder login. These endpoints are typically exposed
 * via an API Gateway.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserServiceClient userServiceClient;

    /**
     * Registers a new user in the system.
     * This endpoint delegates the user creation to the `user-service`, which is responsible
     * for storing user data and sending a verification email.
     * The API Gateway typically exposes this as `POST /api/v1/auth/register`.
     *
     * @param registrationRequest DTO containing the email and password for the new user.
     * @return HTTP 201 Created with a success message if registration is successful.
     *         HTTP 409 Conflict if the email already exists.
     *         HTTP 500 Internal Server Error for other unexpected errors.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest registrationRequest) {
        log.info("Registration attempt for email: {}", registrationRequest.email());
        try {
            ResponseEntity<UserResponse> userResponse = userServiceClient.createUser(
                new CreateUserRequest(registrationRequest.email(), registrationRequest.password())
            );

            if (userResponse.getStatusCode() == HttpStatus.CREATED) {
                log.info("User {} registered successfully via user-service. Verification email should have been sent by user-service.", registrationRequest.email());
                return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully. Please check your email to verify your account.");
            } else {
                log.error("User registration failed at user-service. Status: {}, Body: {}", userResponse.getStatusCode(), userResponse.getBody());
                String errorMessage = "User registration failed at user-service.";
                if (userResponse.hasBody() && userResponse.getBody() instanceof String) {
                    errorMessage = (String) userResponse.getBody();
                } else if (userResponse.hasBody()) {
                    errorMessage = "User registration failed with an unexpected response from user service.";
                }
                return ResponseEntity.status(userResponse.getStatusCode()).body(errorMessage);
            }
        } catch (HttpClientErrorException e) {
            log.error("HttpClientErrorException during registration for email {}: {} - {}", registrationRequest.email(), e.getStatusCode(), e.getResponseBodyAsString(), e);
            String clientErrorMessage;
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                clientErrorMessage = "Registration failed: This email may already be registered or the input is invalid.";
            } else {
                clientErrorMessage = "Registration failed due to a server error. Please try again later.";
            }
            return ResponseEntity.status(e.getStatusCode()).body(clientErrorMessage);
        } catch (Exception e) {
            log.error("Unexpected error during registration for email {}: {}", registrationRequest.email(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during registration.");
        }
    }

    /**
     * Verifies a user's email address using the provided verification code.
     * This endpoint delegates the verification logic to the `user-service`.
     * The API Gateway typically exposes this as `POST /api/v1/auth/verify-email`.
     *
     * @param request DTO containing the user's email and the verification code.
     * @return HTTP 200 OK if email verification is successful.
     *         HTTP 400 Bad Request if the code is invalid, expired, or max attempts exceeded.
     *         HTTP 404 Not Found if the user email does not exist.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailCodeRequest request) {
        try {
            ResponseEntity<Void> verificationResponse = userServiceClient.verifyEmail(
                new dev.skyang.authservice.dto.user.VerifyEmailRequest(request.email(), request.verificationCode())
            );
            if (verificationResponse.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.ok("Email verified successfully.");
            } else {
                return ResponseEntity.status(verificationResponse.getStatusCode()).body("Email verification failed. Status: " + verificationResponse.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            log.error("Error during email verification via UserServiceClient: HTTP {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            return ResponseEntity.status(e.getStatusCode()).body("Email verification failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Unexpected error during email verification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during email verification.");
        }
    }

    /**
     * Placeholder for a local login endpoint.
     * IMPORTANT: This is a non-functional placeholder. For actual local login (username/password),
     * clients should use the OAuth2 token endpoint (`/oauth2/token` or via gateway `/api/v1/oauth2/token`)
     * with `grant_type=password`. This endpoint is not implemented to handle credentials securely
     * or issue tokens.
     *
     * @param loginRequest DTO containing email and password.
     * @return HTTP 501 Not Implemented, indicating this is a placeholder.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        log.warn("/auth/login is a placeholder. For robust local login, clients should use the /oauth2/token endpoint with grant_type=password.");
        try {
            ResponseEntity<UserResponse> userRespEntity = userServiceClient.getUserByEmail(loginRequest.email());
            if (userRespEntity.getStatusCode() == HttpStatus.OK && userRespEntity.getBody() != null) {
                UserResponse user = userRespEntity.getBody();
                if (!user.emailVerified()) {
                    log.warn("Login attempt for unverified email: {}", loginRequest.email());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email not verified. Please verify your email before logging in.");
                }
                log.info("Placeholder login attempt for verified user: {}. Password not checked.", loginRequest.email());
                return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body("Local login via /auth/login is a placeholder and does not perform password validation or token issuance. " +
                          "Please use the /oauth2/token endpoint with grant_type=password.");
            } else {
                log.warn("Login attempt for non-existent user: {}", loginRequest.email());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials or user not found.");
            }
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Login attempt for non-existent user (caught as HttpClientErrorException): {}", loginRequest.email());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials or user not found.");
            }
            log.error("Error during placeholder login check for {}: {}", loginRequest.email(), e.getResponseBodyAsString(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during login: " + e.getResponseBodyAsString());
        }
    }
}
