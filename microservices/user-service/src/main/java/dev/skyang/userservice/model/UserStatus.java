package dev.skyang.userservice.model;

/**
 * Enum representing the status of a user account.
 */
public enum UserStatus {
    /**
     * The user has registered but has not yet verified their email.
     * The account is not active.
     */
    AWAITING_VERIFICATION,

    /**
     * The user has successfully verified their email and the account is fully active.
     */
    ACTIVE,

    /**
     * The account has been suspended by an administrator.
     */
    SUSPENDED,

    /**
     * An intermediate status indicating that the creation process failed.
     * This helps with cleanup or manual intervention.
     */
    REGISTRATION_FAILED
}
