package dev.skyang.userservice.dto;

import jakarta.validation.constraints.NotEmpty;

/**
 * DTO for assigning or revoking a role for a user.
 */
public class RoleAssignmentRequest {

    @NotEmpty(message = "Role name cannot be empty.")
    private String roleName;

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
