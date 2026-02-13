package dev.skyang.userservice;

import dev.skyang.userservice.config.*;
import dev.skyang.userservice.security.CookieBearerTokenResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthConverter jwtAuthConverter;

    @Autowired
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired
    private InternalApiSecretFilter internalApiSecretFilter;

    @Autowired
    private CookieBearerTokenResolver cookieBearerTokenResolver;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exceptions ->
                        exceptions.accessDeniedHandler(customAccessDeniedHandler)
                )
                // Before the standard authentication filter, insert our custom internal API key filter.
                .addFilterBefore(internalApiSecretFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(authz -> authz
                        // --- Publicly accessible endpoints ---
                        .requestMatchers(
                                "/actuator/**",
                                ApiPaths.PUBLIC_BASE + "/**"
                        ).permitAll()

                        // Allow internal API endpoints through to internalApiSecretFilter for security validation
                        .requestMatchers("/api/internal/**").permitAll()

                        // --- Endpoints that require specific permissions ---
                        .requestMatchers(ApiPaths.ADMIN_BASE + "/**").hasAuthority(RoleConstants.ROLE_ADMIN)
                        .requestMatchers(ApiPaths.API_BASE + ApiPaths.ME).hasAnyAuthority(RoleConstants.ROLE_USER, RoleConstants.ROLE_ADMIN)

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                        .bearerTokenResolver(cookieBearerTokenResolver)
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
