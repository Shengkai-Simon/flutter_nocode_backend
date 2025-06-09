package dev.skyang.authservice.service;

import dev.skyang.authservice.client.UserServiceClient;
import dev.skyang.authservice.dto.user.UserCredentialsResponse;
import dev.skyang.authservice.dto.user.UserResponse; // For the second call
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private UserCredentialsResponse userCredentialsResponse;
    private UserResponse userResponse; // For the email verification check

    @BeforeEach
    void setUp() {
        userCredentialsResponse = new UserCredentialsResponse(UUID.randomUUID(), "test@example.com", "hashedPassword");
        // Full UserResponse for the second call in CustomUserDetailsService
        userResponse = new UserResponse(
            userCredentialsResponse.id(),
            userCredentialsResponse.email(),
            true, // emailVerified = true for successful login
            null, null, null, // provider IDs
            LocalDateTime.now(), LocalDateTime.now() // timestamps
        );
    }

    @Test
    void loadUserByUsername_success() {
        when(userServiceClient.getUserCredentials(anyString())).thenReturn(ResponseEntity.ok(userCredentialsResponse));
        // Mock the second call for email verification status
        when(userServiceClient.getUserByEmail(anyString())).thenReturn(ResponseEntity.ok(userResponse));


        UserDetails userDetails = customUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
        assertEquals("hashedPassword", userDetails.getPassword());
        assertTrue(userDetails.isEnabled()); // Because emailVerified was true
    }

    @Test
    void loadUserByUsername_userNotFound_throwsException() {
        when(userServiceClient.getUserCredentials(anyString())).thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername("unknown@example.com"));
    }

    @Test
    void loadUserByUsername_emailNotVerified_throwsException() {
        userResponse = new UserResponse( // Override setup: emailVerified = false
            userCredentialsResponse.id(), userCredentialsResponse.email(), false,
            null, null, null, LocalDateTime.now(), LocalDateTime.now()
        );
        when(userServiceClient.getUserCredentials(anyString())).thenReturn(ResponseEntity.ok(userCredentialsResponse));
        when(userServiceClient.getUserByEmail(anyString())).thenReturn(ResponseEntity.ok(userResponse)); // Return user with emailVerified=false

        Exception exception = assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername("test@example.com");
        });
        assertTrue(exception.getMessage().contains("User email not verified"));
    }

    @Test
    void loadUserByUsername_credentialsCallFails_throwsException() {
        when(userServiceClient.getUserCredentials(anyString())).thenThrow(new RuntimeException("Simulated Feign Exception"));
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername("test@example.com"));
    }

    @Test
    void loadUserByUsername_emailStatusCallFails_throwsException() {
        when(userServiceClient.getUserCredentials(anyString())).thenReturn(ResponseEntity.ok(userCredentialsResponse));
        when(userServiceClient.getUserByEmail(anyString())).thenThrow(new RuntimeException("Simulated Feign Exception on second call"));
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername("test@example.com"));
    }
}
