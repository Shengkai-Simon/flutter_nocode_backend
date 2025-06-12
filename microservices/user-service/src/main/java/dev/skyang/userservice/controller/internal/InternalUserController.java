package dev.skyang.userservice.controller.internal;

import dev.skyang.userservice.dto.UserDetailsResponse;
import dev.skyang.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


/**
 * Controller for internal service-to-service communication.
 * These endpoints should not be exposed via the API Gateway.
 */
@RestController
@RequestMapping("/api/internal/users")
public class InternalUserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{email}")
    public ResponseEntity<UserDetailsResponse> getUserDetailsForAuth(@PathVariable String email) {
        try {
            UserDetailsResponse userDetails = userService.findUserDetailsByEmail(email);
            return ResponseEntity.ok(userDetails);
        } catch (IllegalStateException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint for auth-service to request locking a user account.
     * @param email The email of the user to be locked.
     * @return A confirmation response.
     */
    @PostMapping("/{email}/lock")
    public ResponseEntity<Map<String, String>> lockUserAccount(@PathVariable String email) {
        try {
            userService.lockAccount(email);
            return ResponseEntity.ok(Map.of("message", "Account locked successfully."));
        } catch (Exception e) {
            // Log the exception, e.g., using slf4j logger
            return ResponseEntity.status(500).body(Map.of("error", "Failed to lock account."));
        }
    }

    /**
     * Endpoint for auth-service to request resetting login attempts upon successful login.
     * @param email The email of the user.
     * @return A confirmation response with no body content.
     */
    @DeleteMapping("/{email}/login-attempts")
    public ResponseEntity<Void> resetLoginAttempts(@PathVariable String email) {
        userService.resetLoginAttempts(email);
        return ResponseEntity.noContent().build();
    }
}
