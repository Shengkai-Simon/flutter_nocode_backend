package dev.skyang.userservice.controller.api;

import dev.skyang.userservice.config.ApiPaths;
import dev.skyang.userservice.dto.*;
import dev.skyang.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping(ApiPaths.API_BASE) // Base path for the controller
public class UserController {

    @Autowired
    private UserService userService;

    // --- Public Endpoints under /api/public/ ---

    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.REGISTER)
    public Map<String, String> registerUser(@Valid @RequestBody RegistrationRequest request) {
        userService.register(request);
        return Map.of("message", "Registration successful. Please check your email for verification code.");
    }

    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.VERIFY)
    public Map<String, String> verifyUser(@Valid @RequestBody VerificationRequest request) {
        userService.verify(request);
        return Map.of("message", "Account verified successfully.");
    }

    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.RESEND_VERIFICATION)
    public Map<String, String> resendVerification(@Valid @RequestBody EmailRequest request) {
        userService.resendVerificationCode(request.getEmail());
        return Map.of("message", "A new verification code has been sent to your email.");
    }

    /**
     * Endpoint to request an unlock token for a locked account.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.REQUEST_UNLOCK)
    public Map<String, String> requestUnlock(@Valid @RequestBody EmailRequest request) {
        userService.requestAccountUnlock(request.getEmail());
        return Map.of("message", "If your account is locked, an unlock email has been sent.");
    }

    /**
     * Endpoint to perform the account unlock using a token.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.PERFORM_UNLOCK)
    public Map<String, String> performUnlock(@Valid @RequestBody PerformUnlockRequest request) {
        userService.performAccountUnlock(request.getToken());
        return Map.of("message", "Your account has been successfully unlocked.");
    }

    /**
     * Endpoint to request a password reset token.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.FORGOT_PASSWORD)
    public Map<String, String> forgotPassword(@Valid @RequestBody EmailRequest request) {
        userService.forgotPassword(request.getEmail());
        return Map.of("message", "If an account with that email exists, a password reset email has been sent.");
    }

    /**
     * Endpoint to perform the password reset using a token.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.RESET_PASSWORD)
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return Map.of("message", "Your password has been successfully reset.");
    }

    @GetMapping(ApiPaths.ME)
    public UserProfileResponse getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("User not authenticated.");
        }
        // principal.getName() In JWT configuration, this is the user's mailbox
        return userService.findUserProfileByEmail(principal.getName());
    }
}
