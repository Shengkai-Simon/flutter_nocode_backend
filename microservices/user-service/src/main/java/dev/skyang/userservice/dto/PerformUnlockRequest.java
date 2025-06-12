package dev.skyang.userservice.dto;

import jakarta.validation.constraints.NotEmpty;

public class PerformUnlockRequest {
    @NotEmpty
    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}