package dev.skyang.userservice.dto;

import dev.skyang.userservice.model.User;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * DTO for returning user information, safe for admin-level exposure.
 */
public class UserResponse {

    private Long id;
    private String email;
    private String status;
    private Set<String> roles;
    private LocalDateTime createdAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.status = user.getStatus().name();
        this.roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        this.createdAt = user.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
