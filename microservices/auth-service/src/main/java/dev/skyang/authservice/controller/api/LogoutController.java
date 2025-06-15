package dev.skyang.authservice.controller.api;

import dev.skyang.authservice.config.ApiPaths;
import dev.skyang.authservice.service.TokenBlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(ApiPaths.API_BASE)
public class LogoutController {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @PostMapping(ApiPaths.LOGOUT) // Use /api/logout as the logout path
    public Map<String, String> logout(@AuthenticationPrincipal Jwt jwt) {
        tokenBlacklistService.blacklist(jwt);
        return Map.of("message", "Logout successful.");
    }
}