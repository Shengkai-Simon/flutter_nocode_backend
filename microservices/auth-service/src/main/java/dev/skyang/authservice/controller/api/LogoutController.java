package dev.skyang.authservice.controller.api;

import dev.skyang.authservice.config.ApiPaths;
import dev.skyang.authservice.config.SsoCookieProperties;
import dev.skyang.authservice.service.TokenBlacklistService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(ApiPaths.API_BASE)
public class LogoutController {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private SsoCookieProperties ssoCookieProperties;

    @PostMapping(ApiPaths.LOGOUT)
    public Map<String, String> logout(@AuthenticationPrincipal Jwt jwt, HttpServletResponse response) {
        tokenBlacklistService.blacklist(jwt);

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(ssoCookieProperties.getCookieName(), "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Expire the cookie immediately
                .sameSite("Lax");

        // Set domain only if it's configured
        if (StringUtils.hasText(ssoCookieProperties.getDomain())) {
            cookieBuilder.domain(ssoCookieProperties.getDomain());
        }

        response.addHeader("Set-Cookie", cookieBuilder.build().toString());

        return Map.of("message", "Logout successful.");
    }
}