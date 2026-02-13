package dev.skyang.userservice.service;

import dev.skyang.userservice.config.RoleConstants;
import dev.skyang.userservice.dto.*;
import dev.skyang.userservice.model.Role;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import dev.skyang.userservice.repository.RoleRepository;
import dev.skyang.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    // --- Redis Key Prefixes and TTLs ---
    private static final String VERIFICATION_CODE_PREFIX = "verification:code:";
    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";
    private static final String UNLOCK_TOKEN_PREFIX = "unlock:token:";
    private static final String PASSWORD_RESET_TOKEN_PREFIX = "reset-password:token:";
    // Reverse mapping prefixes
    private static final String USER_TO_UNLOCK_TOKEN_PREFIX = "user:unlock-token:";
    private static final String USER_TO_PASSWORD_RESET_TOKEN_PREFIX = "user:password-reset-token:";

    // --- Cooldown Key Prefixes and TTL ---
    private static final String COOLDOWN_REGISTER_PREFIX = "cooldown:register:";
    private static final String COOLDOWN_RESEND_VERIFICATION_PREFIX = "cooldown:resend-verification:";
    private static final String COOLDOWN_UNLOCK_PREFIX = "cooldown:unlock:";
    private static final String COOLDOWN_PASSWORD_RESET_PREFIX = "cooldown:password-reset:";
    private static final long EMAIL_COOLDOWN_SECONDS = 60; // 60-second cooldown for all email operations

    private static final long VERIFICATION_CODE_TTL_MINUTES = 5;
    private static final long UNLOCK_TOKEN_TTL_MINUTES = 15;
    private static final long PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;


    // --- RabbitMQ Constants ---
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String EMAIL_ROUTING_KEY = "email.routing.key";


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * Checks if an operation for a given email is on cooldown.
     * Throws an exception if it is.
     */
    private void checkCooldown(String email, String prefix, String errorMessage) {
        String cooldownKey = prefix + email;
        if (redisTemplate.hasKey(cooldownKey)) {
            throw new IllegalStateException(errorMessage);
        }
    }

    /**
     * Sets the cooldown for an operation for a given email.
     */
    private void setCooldown(String email, String prefix) {
        String cooldownKey = prefix + email;
        redisTemplate.opsForValue().set(cooldownKey, "1", EMAIL_COOLDOWN_SECONDS, TimeUnit.SECONDS);
    }


    /**
     * Registers a new user or re-initiates verification for an existing unverified user.
     */
    @Transactional
    public void register(RegistrationRequest request) {
        checkCooldown(request.getEmail(), COOLDOWN_REGISTER_PREFIX, "Please wait a moment before trying to register again.");

        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

        if (existingUserOpt.isPresent()) {
            // --- Path A: Handle users that already exist but are not activated ---
            User existingUser = existingUserOpt.get();
            log.info("Updating existing unverified user: {}", request.getEmail());

            if (existingUser.getStatus() == UserStatus.ACTIVE) {
                throw new IllegalStateException("User with email " + request.getEmail() + " already exists and is active.");
            }

            // Make sure that existing users also have roles
            if (existingUser.getRoles().isEmpty()) {
                Role defaultRole = roleRepository.findByName(RoleConstants.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_USER not found."));
                existingUser.getRoles().add(defaultRole);
            }

            // Update your password and save it. Because existingUser is persistent, a one-time save is sufficient.
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(existingUser);

            // Send a verification code
            sendVerificationCode(existingUser.getEmail());

        } else {
            // --- Path B: Dealing with brand new users, you must use the "two-step save method"---
            log.info("Creating a new user account for: {}", request.getEmail());

            // 1. Create and save a User object without a role so that it is a JPA-managed entity.
            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setStatus(UserStatus.AWAITING_VERIFICATION);
            User savedUser = userRepository.save(newUser);

            // 2. This 'savedUser' object is managed, and we can safely add roles to it.
            Role defaultRole = roleRepository.findByName(RoleConstants.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_USER not found."));
            savedUser.getRoles().add(defaultRole);

            // 3. Send a verification code. The transaction is committed at the end of the method and the new role relationship is automatically written to the database.
            sendVerificationCode(savedUser.getEmail());
        }

        // Set cooldown only after all checks passed and email is sent
        setCooldown(request.getEmail(), COOLDOWN_REGISTER_PREFIX);
    }

    /**
     * Resends a verification code to the user, respecting the cooldown period.
     * @param email The user's email.
     */
    public void resendVerificationCode(String email) {
        checkCooldown(email, COOLDOWN_RESEND_VERIFICATION_PREFIX, "Please wait before requesting a new code.");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found."));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("Account is already active.");
        }

        sendVerificationCode(email);

        // Set cooldown only after all checks passed and email is sent
        setCooldown(email, COOLDOWN_RESEND_VERIFICATION_PREFIX);
    }

    /**
     * Core method: Generates, stores, and dispatches the verification code.
     * @param email The target email address.
     */
    private void sendVerificationCode(String email) {
        String code = generateVerificationCode();
        String redisKey = VERIFICATION_CODE_PREFIX + email;

        try {
            redisTemplate.opsForValue().set(redisKey, code, VERIFICATION_CODE_TTL_MINUTES, TimeUnit.MINUTES);

            String emailBody = "Welcome! Your verification code is: " + code;
            NotificationMessage message = new NotificationMessage(email, "Verify Your Account", emailBody);
            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, EMAIL_ROUTING_KEY, message);

        } catch (Exception e) {
            // If any of these critical steps fail, we must log it and inform the user.
            // A more advanced Saga implementation would handle compensation here.
            log.error("Critical Failure: Could not send verification code for email {}. Reason: {}", email, e.getMessage(), e);
            // Clean up the code key if it was set, to allow for a retry.
            redisTemplate.delete(redisKey);
            throw new IllegalStateException("Failed to send verification code. Please try again later.");
        }
    }

    @Transactional
    public void verify(VerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found."));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("Account is already active.");
        }

        String redisKey = VERIFICATION_CODE_PREFIX + request.getEmail();
        String storedCode = redisTemplate.opsForValue().get(redisKey);

        if (storedCode == null) {
            throw new IllegalStateException("Verification code has expired or does not exist.");
        }

        if (!Objects.equals(request.getCode(), storedCode)) {
            throw new IllegalStateException("Invalid verification code.");
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        redisTemplate.delete(redisKey);
    }

    /**
     * Locks a user account due to excessive failed login attempts.
     * This method is intended to be called by the auth-service.
     * @param email The email of the user to lock.
     */
    @Transactional
    public void lockAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Cannot lock non-existent user."));

        // Don't re-lock an already locked or non-active account.
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Attempted to lock an account that is not currently active. Email: {}", email);
            return;
        }

        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        log.info("Account for user {} has been locked due to failed login attempts.", email);

        // As a good practice, we can also clear any existing login attempt counts for this user.
        redisTemplate.delete(LOGIN_ATTEMPT_PREFIX + email);
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(1000000);
        return String.format("%06d", num);
    }

    public UserDetailsResponse findUserDetailsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User with email " + email + " not found."));

        // --- Extract the role name ---
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new UserDetailsResponse(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getStatus().name(),
                roleNames // Pass the role name to the DTO
        );
    }

    // Reset the failure count after a successful login
    public void resetLoginAttempts(String email) {
        redisTemplate.delete(LOGIN_ATTEMPT_PREFIX + email);
    }

    /**
     * Finds all users. Intended for admin use only.
     * @return A list of all users, mapped to UserResponse DTOs.
     */
    public List<UserResponse> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Initiates the account unlock process for a locked user.
     * @param email The email of the locked account.
     */
    public void requestAccountUnlock(String email) {
        checkCooldown(email, COOLDOWN_UNLOCK_PREFIX, "Please wait a moment before requesting another account unlock email.");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found."));

        if (user.getStatus() != UserStatus.SUSPENDED) {
            throw new IllegalStateException("Account is not locked.");
        }

        // Invalidate old unlock token if exists
        String userToTokenKey = USER_TO_UNLOCK_TOKEN_PREFIX + email;
        String oldToken = redisTemplate.opsForValue().get(userToTokenKey);
        if (oldToken != null) {
            redisTemplate.delete(UNLOCK_TOKEN_PREFIX + oldToken);
            log.info("Invalidated old unlock token for user: {}", email);
        }

        String token = UUID.randomUUID().toString();
        String redisKey = UNLOCK_TOKEN_PREFIX + token;

        // Store primary and reverse mappings
        redisTemplate.opsForValue().set(redisKey, email, UNLOCK_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(userToTokenKey, token, UNLOCK_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);

        String emailBody = "An account unlock was requested for your account. This link is valid for 15 minutes.\n\n"
                + "Unlock Token: " + token + "\n\n"
                + "If you did not request this, please ignore this email.";
        NotificationMessage message = new NotificationMessage(email, "Account Unlock Request", emailBody);
        rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, EMAIL_ROUTING_KEY, message);

        // Set cooldown only after all checks passed and email is sent
        setCooldown(email, COOLDOWN_UNLOCK_PREFIX);

        log.info("Unlock token sent for locked account: {}", email);
    }

    /**
     * Unlocks an account using a valid unlock token.
     * @param token The single-use unlock token from the email.
     */
    @Transactional
    public void performAccountUnlock(String token) {
        String redisKey = UNLOCK_TOKEN_PREFIX + token;

        // Look up the token from Redis, and if it exists, it returns the associated email
        String email = redisTemplate.opsForValue().get(redisKey);

        if (email == null) {
            throw new IllegalStateException("Invalid or expired unlock token.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User associated with token not found."));

        // Perform an unlock operation
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        // Clean up all related tokens and attempts
        redisTemplate.delete(LOGIN_ATTEMPT_PREFIX + email);
        redisTemplate.delete(redisKey);
        redisTemplate.delete(USER_TO_UNLOCK_TOKEN_PREFIX + email); // <-- Clean up reverse mapping

        log.info("Account for user {} has been successfully unlocked.", email);
    }

    /**
     * Initiates the password reset process for a user.
     * @param email The user's email.
     */
    public void forgotPassword(String email) {
        checkCooldown(email, COOLDOWN_PASSWORD_RESET_PREFIX, "Please wait a moment before requesting another password reset email.");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found."));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new IllegalStateException("Cannot reset password for a locked account. Please unlock it first.");
        }

        // Invalidate old password reset token if exists
        String userToTokenKey = USER_TO_PASSWORD_RESET_TOKEN_PREFIX + email;
        String oldToken = redisTemplate.opsForValue().get(userToTokenKey);
        if (oldToken != null) {
            redisTemplate.delete(PASSWORD_RESET_TOKEN_PREFIX + oldToken);
            log.info("Invalidated old password reset token for user: {}", email);
        }

        String token = UUID.randomUUID().toString();
        String redisKey = PASSWORD_RESET_TOKEN_PREFIX + token;

        // Store primary and reverse mappings
        redisTemplate.opsForValue().set(redisKey, email, PASSWORD_RESET_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(userToTokenKey, token, PASSWORD_RESET_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);

        String emailBody = "A password reset was requested for your account. This link is valid for 15 minutes.\n\n"
                + "Reset Token: " + token + "\n\n"
                + "If you did not request this, please ignore this email.";
        NotificationMessage message = new NotificationMessage(email, "Password Reset Request", emailBody);
        rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, EMAIL_ROUTING_KEY, message);

        // Set cooldown only after all checks passed and email is sent
        setCooldown(email, COOLDOWN_PASSWORD_RESET_PREFIX);

        log.info("Password reset token sent for user: {}", email);
    }

    /**
     * Resets a user's password using a valid reset token.
     * @param token The single-use reset token.
     * @param newPassword The new password.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String redisKey = PASSWORD_RESET_TOKEN_PREFIX + token;
        String email = redisTemplate.opsForValue().get(redisKey);

        if (email == null) {
            throw new IllegalStateException("Invalid or expired password reset token.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User associated with token not found."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Clean up all related tokens
        redisTemplate.delete(redisKey);
        redisTemplate.delete(USER_TO_PASSWORD_RESET_TOKEN_PREFIX + email); // <-- Clean up reverse mapping

        log.info("Password for user {} has been successfully reset.", email);
    }

    /**
     * Assigns a role to a specified user.
     * @param userId The ID of the user.
     * @param roleName The name of the role to assign (e.g., "ROLE_ADMIN").
     */
    @Transactional
    public void assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found with ID: " + userId));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        user.getRoles().add(role);
        userRepository.save(user);

        log.info("Assigned role {} to user {}", roleName, user.getEmail());
    }

    /**
     * Revokes a role from a specified user.
     * @param userId The ID of the user.
     * @param roleName The name of the role to revoke.
     */
    @Transactional
    public void revokeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found with ID: " + userId));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

        if (user.getRoles().remove(role)) {
            userRepository.save(user);
            log.info("Revoked role {} from user {}", roleName, user.getEmail());
        } else {
            log.warn("User {} did not have role {} to revoke.", user.getEmail(), roleName);
        }
    }

    /**
     * Find users based on their email address and return personal information for front-end display
     * @param email The user's mailbox, which is the name of the principal
     * @return UserProfileResponse DTO
     */
    public UserProfileResponse findUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User with email " + email + " not found."));
        return new UserProfileResponse(user);
    }
}