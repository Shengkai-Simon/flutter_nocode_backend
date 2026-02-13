package dev.skyang.authservice.controller.api;

import dev.skyang.authservice.config.ApiPaths;
import dev.skyang.authservice.config.SsoCookieProperties;
import dev.skyang.authservice.dto.LoginRequest;
import dev.skyang.authservice.dto.LoginSuccessResponse;
import dev.skyang.authservice.security.CustomUserDetails;
import dev.skyang.authservice.service.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.API_BASE)
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private SsoCookieProperties ssoCookieProperties;

    /**
     * Handle user login requests.
     * If successful, the returned LoginResponse will be automatically encapsulated by the GlobalResponseHandler.
     * When it fails (AuthenticationException), it will be caught and handled by the GlobalExceptionHandler.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.LOGIN)
    public LoginSuccessResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenService.generateToken(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(ssoCookieProperties.getCookieName(), token)
                .httpOnly(true)
                .secure(true) // Should be true in production
                .path("/")
                .maxAge(ssoCookieProperties.getMaxAgeSeconds())
                .sameSite("Lax");

        // Set domain only if it's configured (for production)
        if (StringUtils.hasText(ssoCookieProperties.getDomain())) {
            cookieBuilder.domain(ssoCookieProperties.getDomain());
        }

        response.addHeader("Set-Cookie", cookieBuilder.build().toString());

        return new LoginSuccessResponse(userDetails.getId(), userDetails.getUsername());
    }
}