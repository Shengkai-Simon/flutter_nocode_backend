package dev.skyang.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

/**
 * DTO for email verification requests.
 */
public class VerificationRequest {

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Email should be valid")
    private String email;

    @NotEmpty(message = "Verification code cannot be empty")
    private String code;

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
