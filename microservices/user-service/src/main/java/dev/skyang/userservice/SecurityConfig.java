package dev.skyang.userservice;

import dev.skyang.userservice.config.ApiPaths;
import dev.skyang.userservice.config.CustomAccessDeniedHandler;
import dev.skyang.userservice.config.JwtAuthConverter;
import dev.skyang.userservice.config.RoleConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthConverter jwtAuthConverter; // Inject custom converter

    @Autowired
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions ->
                        exceptions.accessDeniedHandler(customAccessDeniedHandler)
                )
                .authorizeHttpRequests(authz -> authz
                        // --- Publicly accessible endpoints ---
                        .requestMatchers(
                                "/actuator/**",
                                ApiPaths.PUBLIC_BASE + "/**",
                                "/api/internal/**"
                        ).permitAll()

                        // --- Endpoints that require specific permissions ---
                        // Only users with "ROLE_ADMIN" permissions can access all paths under /api/admin/
                        .requestMatchers(ApiPaths.ADMIN_BASE + "/**").hasAuthority(RoleConstants.ROLE_ADMIN)

                        // --- Endpoints that require authentication but don't require a specific role ---
                        .requestMatchers(ApiPaths.API_BASE + ApiPaths.ME).hasAnyAuthority(RoleConstants.ROLE_USER, RoleConstants.ROLE_ADMIN)

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        // Use our custom converter to parse JWTs
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
