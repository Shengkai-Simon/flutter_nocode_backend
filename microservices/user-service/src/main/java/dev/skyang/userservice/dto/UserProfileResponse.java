package dev.skyang.userservice.dto;

import dev.skyang.userservice.model.Role;
import dev.skyang.userservice.model.User;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * A DTO used to securely return the current logged-in user information to the frontend
 */
public class UserProfileResponse {

    private Long id;
    private String email;
    private Set<String> roles;

    public UserProfileResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}