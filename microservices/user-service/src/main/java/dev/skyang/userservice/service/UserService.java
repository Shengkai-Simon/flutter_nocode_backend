package dev.skyang.userservice.service;

import dev.skyang.userservice.client.NotificationServiceClient; // New import
import dev.skyang.userservice.dto.CreateUserRequest;
import dev.skyang.userservice.dto.UserCredentialsResponse; // Keep this, it's used by another method
import dev.skyang.userservice.dto.UserResponse; // Keep this
import dev.skyang.userservice.dto.VerifyEmailRequest; // Keep this
import dev.skyang.userservice.dto.LinkProviderRequest; // Keep this
import dev.skyang.userservice.dto.notification.NotificationRequest; // New import
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Added for logging
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional; // Keep this
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j // Added Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationServiceClient notificationServiceClient; // Injected

    @Transactional
    public User createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            // Consider using a more specific exception or a custom one
            throw new IllegalArgumentException("Email already in use: " + request.email());
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        String verificationCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationCodeExpiresAt(LocalDateTime.now().plusHours(24));
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Send verification email
        try {
            String emailSubject = "Verify Your Email Address";
            String emailBody = String.format(
                "Hello %s,\n\nThank you for registering. Please use the following code to verify your email address:\n\n%s\n\nThis code will expire in 24 hours.\n\nIf you did not register, please ignore this email.",
                savedUser.getEmail(),
                verificationCode
            );
            notificationServiceClient.sendEmail(new NotificationRequest(savedUser.getEmail(), emailSubject, emailBody));
            log.info("Verification email initiated for user: {}", savedUser.getEmail());
        } catch (Exception e) {
            // Log error but don't fail user creation transaction
            log.error("Failed to send verification email to user {}: {}", savedUser.getEmail(), e.getMessage(), e);
        }

        return savedUser;
    }

    @Transactional
    public boolean verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.email()));

        if (user.isEmailVerified()) return true;

        // Check for max attempts
        if (user.getEmailVerificationAttempts() >= 5) { // Max 5 attempts
            // Optionally, add a time check: e.g., if lastEmailVerificationAttemptAt is within X minutes, block.
            // For now, just blocking if attempts >= 5.
            log.warn("Maximum email verification attempts exceeded for {}. Current attempts: {}", request.email(), user.getEmailVerificationAttempts());
            throw new IllegalArgumentException("Maximum email verification attempts exceeded for " + request.email() + ". Please try again later or request a new code.");
        }

        if (user.getEmailVerificationCode() != null &&
            user.getEmailVerificationCode().equals(request.verificationCode()) &&
            user.getEmailVerificationCodeExpiresAt() != null &&
            user.getEmailVerificationCodeExpiresAt().isAfter(LocalDateTime.now())) {

            user.setEmailVerified(true);
            user.setEmailVerificationCode(null);
            user.setEmailVerificationCodeExpiresAt(null);
            user.setEmailVerificationAttempts(0); // Reset attempts
            user.setLastEmailVerificationAttemptAt(null); // Reset last attempt time
            userRepository.save(user);
            log.info("Email successfully verified for user: {}", user.getEmail());
            return true;
        } else {
            // Code is incorrect or expired
            user.setEmailVerificationAttempts(user.getEmailVerificationAttempts() + 1);
            user.setLastEmailVerificationAttemptAt(LocalDateTime.now());
            userRepository.save(user);
            log.warn("Invalid or expired verification code for user {}. Attempt {} recorded.", request.email(), user.getEmailVerificationAttempts());
            return false; // This will result in a 400 Bad Request from controller based on current setup.
        }
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findUserByProviderId(String provider, String providerId) {
        switch (provider.toLowerCase()) {
            case "google": return userRepository.findByGoogleId(providerId);
            case "apple": return userRepository.findByAppleId(providerId);
            case "microsoft": return userRepository.findByMicrosoftId(providerId);
            default:
                log.warn("Attempt to find user by unknown provider: {}", provider);
                throw new IllegalArgumentException("Unknown provider: " + provider);
        }
    }

    @Transactional
    public User linkProviderToUser(UUID userId, LinkProviderRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        log.info("Linking provider {} to user {}", request.provider(), userId);
        updateProviderIdForUser(user, request.provider(), request.providerId());
        return userRepository.save(user);
    }

    @Transactional
    public User createOrUpdateUserForProvider(String email, String provider, String providerId) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            log.info("Updating existing user {} for provider {} login", email, provider);
        } else {
            user = new User();
            user.setEmail(email);
            log.info("Creating new user {} for provider {} login", email, provider);
        }
        user.setEmailVerified(true); // Users from trusted 3rd party are auto-verified
        updateProviderIdForUser(user, provider, providerId);
        return userRepository.save(user);
    }

    private void updateProviderIdForUser(User user, String provider, String providerId) {
         switch (provider.toLowerCase()) {
            case "google": user.setGoogleId(providerId); break;
            case "apple": user.setAppleId(providerId); break;
            case "microsoft": user.setMicrosoftId(providerId); break;
            default:
                log.warn("Attempt to update provider ID for user {} with unknown provider: {}", user.getEmail(), provider);
                throw new IllegalArgumentException("Unknown provider: " + provider);
        }
    }

    public UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
            user.getId(), user.getEmail(), user.isEmailVerified(),
            user.getGoogleId(), user.getAppleId(), user.getMicrosoftId(),
            user.getCreatedAt(), user.getUpdatedAt()
        );
    }

    public Optional<UserCredentialsResponse> getUserCredentialsByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(user -> new UserCredentialsResponse(user.getId(), user.getEmail(), user.getPasswordHash()));
    }
}
