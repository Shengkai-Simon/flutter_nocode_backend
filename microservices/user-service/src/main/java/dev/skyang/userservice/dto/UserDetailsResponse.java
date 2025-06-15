package dev.skyang.userservice.dto;

import java.util.Set;

/**
 * DTO for securely providing user details to other internal services.
 */
public class UserDetailsResponse {

    private String email;
    private String password; // The hashed password
    private String status;   // e.g., "ACTIVE", "PENDING_VERIFICATION"
    private Set<String> roles;
    private boolean enabled;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private boolean accountNonExpired;

    public UserDetailsResponse(String email, String password, String status, Set<String> roles) {
        this.email = email;
        this.password = password;
        this.status = status;
        this.roles = roles;
        this.enabled = "ACTIVE".equalsIgnoreCase(status);
        this.accountNonLocked = !"SUSPENDED".equalsIgnoreCase(status);
        this.credentialsNonExpired = true; // Placeholder logic
        this.accountNonExpired = true;     // Placeholder logic
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }
    public boolean isCredentialsNonExpired() { return credentialsNonExpired; }
    public void setCredentialsNonExpired(boolean credentialsNonExpired) { this.credentialsNonExpired = credentialsNonExpired; }
    public boolean isAccountNonExpired() { return accountNonExpired; }
    public void setAccountNonExpired(boolean accountNonExpired) { this.accountNonExpired = accountNonExpired; }
}

