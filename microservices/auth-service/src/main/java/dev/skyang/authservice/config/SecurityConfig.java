package dev.skyang.authservice.config;

import dev.skyang.authservice.service.CustomOAuth2UserService;
import dev.skyang.authservice.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomUserDetailsService customUserDetailsService;

    // This SecurityFilterChain is for UI/application specific security.
    // It should be ordered AFTER the AuthorizationServer's default SecurityFilterChain (Order(1))
    // and general default SecurityFilterChain in AuthorizationServerConfig (Order(2)).
    // However, typical Spring Boot security setup without explicit AS might use a single chain or specific order.
    // Let's use @Order(0) to ensure it's processed before the very generic one in AS config if that one is too broad.
    // Or, more traditionally, the AS config is very specific, and this one handles everything else.
    // The default chain in AS config was set to Order(2) and .anyRequest().authenticated().
    // This new one will take precedence for the specified matchers.
    // For a typical setup, the AuthorizationServerConfigurer usually sets up its own filter chains at a specific order (Order(0) or Order(1)).
    // We need to ensure this config co-exists.
    // The one in AuthorizationServerConfig at Order(2) with .formLogin() will handle the AS's initiated logins.
    // This one can be for other app specific paths and oauth2login customizations.
    // Let's re-evaluate the ordering.
    // Spring Authorization Server's main filter chain is @Order(1).
    // The default filter chain in AuthorizationServerConfig is @Order(2).
    // This one should probably be for paths not handled by AS, and to define how users authenticate TO the AS (formLogin, oauth2Login).
    // Let's try making this the primary "user-facing" security config.

    @Bean
    @Order(2) // Must be after OAuth2AuthorizationServerConfiguration.DEFAULT_FILTER_ORDER (which is 0)
              // And after the one in AuthorizationServerConfig (Order(1)) that has .oidc(Customizer.withDefaults())
              // Let's adjust the one in AuthorizationServerConfig to be higher order or remove its formLogin if this takes over.
              // For clarity, let's assume the SecurityFilterChain in AuthorizationServerConfig with Order(2) handles general authenticated access and form login.
              // This one below will specifically configure /auth/** and oauth2Login.
              // To avoid conflict with the default .anyRequest().authenticated() in AuthorizationServerConfig's Order(2) chain,
              // that one should be made more specific or this one needs to be comprehensive.
              // Let's modify this to be the main user-facing security chain and adjust AuthorizationServerConfig's default chain.
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/auth/register", "/auth/verify-email", "/auth/login").permitAll() // Custom auth endpoints
                .requestMatchers("/login", "/error", "/webjars/**", "/assets/**").permitAll() // Standard Spring Security paths, resources
                .anyRequest().authenticated()
            )
            .formLogin(login -> login
                .loginPage("/login").permitAll() // Specify custom login page if you have one
            )
            .oauth2Login(oauth2Login -> oauth2Login
                .loginPage("/login").permitAll() // Can be same as form login page
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers("/auth/**")); // CSRF typically disabled for /auth endpoints if sessionless or different mechanism

        return http.build();
    }

    // PasswordEncoder bean - Using delegating encoder for flexibility
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    // AuthenticationManager bean - Needed for password grant type in Spring Authorization Server
    // It uses the CustomUserDetailsService and PasswordEncoder.
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(customUserDetailsService)
                                    .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }
}
