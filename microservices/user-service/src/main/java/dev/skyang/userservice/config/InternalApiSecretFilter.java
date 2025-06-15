package dev.skyang.userservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiSecretFilter extends OncePerRequestFilter {

    @Value("${app.security.internal-api-key.primary}")
    private String primaryApiKey;

    @Value("${app.security.internal-api-key.secondary}")
    private String secondaryApiKey;

    private static final String API_KEY_HEADER = "X-Internal-API-Key";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String actualApiKey = request.getHeader(API_KEY_HEADER);

        boolean isValid = primaryApiKey.equals(actualApiKey) || (StringUtils.hasText(secondaryApiKey) && secondaryApiKey.equals(actualApiKey));

        if (isValid) {
            // The key is matched, and the request is released to the next filter or target controller
            filterChain.doFilter(request, response);
        } else {
            // If the keys do not match or do not exist, the request is rejected immediately
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Unauthorized: Invalid or missing API Key");
        }
    }

    /**
     * This filter works for internal APIs.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/api/internal");
    }
}