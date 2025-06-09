package dev.skyang.userservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a user in the system.
 * This entity stores user profile information, credentials for local accounts,
 * email verification details, and identifiers for third-party OAuth providers.
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Unique identifier for the user (UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * User's email address. It must be unique and is used for login,
     * communication, and as a primary identifier in many flows.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Hashed password for users who register directly (local accounts).
     * This field can be null if the user signed up using a third-party OAuth provider
     * and has not set a local password.
     */
    @Column(nullable = true)
    private String passwordHash;

    /**
     * Flag indicating whether the user's email address has been verified.
     * Defaults to false.
     */
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified;

    /**
     * The verification code sent to the user's email address.
     * This code is used to confirm ownership of the email. Nullified after successful verification.
     */
    @Column(nullable = true)
    private String emailVerificationCode;

    /**
     * The timestamp indicating when the email verification code expires.
     * Nullified after successful verification.
     */
    @Column(nullable = true)
    private LocalDateTime emailVerificationCodeExpiresAt;

    /**
     * Stores the user's unique identifier from Google, if they linked their Google account.
     * Must be unique across all users.
     */
    @Column(unique = true, nullable = true)
    private String googleId;

    /**
     * Stores the user's unique identifier from Apple, if they linked their Apple account.
     * Must be unique across all users.
     */
    @Column(unique = true, nullable = true)
    private String appleId;

    /**
     * Stores the user's unique identifier from Microsoft, if they linked their Microsoft account.
     * Must be unique across all users.
     */
    @Column(unique = true, nullable = true)
    private String microsoftId;

    /**
     * Timestamp indicating when the user record was created. Cannot be updated.
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp indicating the last time the user record was updated.
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Tracks the number of failed attempts to verify the email with a code.
     * Used for brute-force protection. Reset to 0 on successful verification.
     */
    private int emailVerificationAttempts;

    /**
     * Timestamp of the last failed email verification attempt.
     * Can be used in conjunction with {@code emailVerificationAttempts} for lockout logic.
     * Nullified on successful verification.
     */
    private LocalDateTime lastEmailVerificationAttemptAt;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getEmailVerificationCode() {
        return emailVerificationCode;
    }

    public void setEmailVerificationCode(String emailVerificationCode) {
        this.emailVerificationCode = emailVerificationCode;
    }

    public LocalDateTime getEmailVerificationCodeExpiresAt() {
        return emailVerificationCodeExpiresAt;
    }

    public void setEmailVerificationCodeExpiresAt(LocalDateTime emailVerificationCodeExpiresAt) {
        this.emailVerificationCodeExpiresAt = emailVerificationCodeExpiresAt;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getAppleId() {
        return appleId;
    }

    public void setAppleId(String appleId) {
        this.appleId = appleId;
    }

    public String getMicrosoftId() {
        return microsoftId;
    }

    public void setMicrosoftId(String microsoftId) {
        this.microsoftId = microsoftId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getEmailVerificationAttempts() {
        return emailVerificationAttempts;
    }

    public void setEmailVerificationAttempts(int emailVerificationAttempts) {
        this.emailVerificationAttempts = emailVerificationAttempts;
    }

    public LocalDateTime getLastEmailVerificationAttemptAt() {
        return lastEmailVerificationAttemptAt;
    }

    public void setLastEmailVerificationAttemptAt(LocalDateTime lastEmailVerificationAttemptAt) {
        this.lastEmailVerificationAttemptAt = lastEmailVerificationAttemptAt;
    }

    /**
     * Sets createdAt and updatedAt timestamps before the entity is persisted.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    /**
     * Updates the updatedAt timestamp before the entity is updated.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
