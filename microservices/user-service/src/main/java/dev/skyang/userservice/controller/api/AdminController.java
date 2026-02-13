package dev.skyang.userservice.controller.api;

import dev.skyang.userservice.config.ApiPaths;
import dev.skyang.userservice.dto.RoleAssignmentRequest;
import dev.skyang.userservice.dto.UserResponse;
import dev.skyang.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(ApiPaths.ADMIN_BASE)
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping(ApiPaths.ADMIN_USERS)
    public List<UserResponse> listAllUsers() {
        return userService.findAllUsers();
    }

    /**
     * Endpoint for an admin to assign a role to a user.
     */
    @PostMapping(ApiPaths.ADMIN_USER_ROLES)
    public Map<String, String> assignRole(@PathVariable Long userId, @Valid @RequestBody RoleAssignmentRequest request) {
        userService.assignRoleToUser(userId, request.getRoleName());
        return Map.of("message", "Role assigned successfully.");
    }

    /**
     * Endpoint for an admin to revoke a role from a user.
     */
    @DeleteMapping(ApiPaths.ADMIN_USER_ROLES)
    public Map<String, String> revokeRole(@PathVariable Long userId, @Valid @RequestBody RoleAssignmentRequest request) {
        // Ensure we don't allow revoking the last essential role, for example.
        // For simplicity, we currently allow it.
        // A check could be added in the service layer.
        userService.revokeRoleFromUser(userId, request.getRoleName());
        return Map.of("message", "Role revoked successfully.");
    }
}
