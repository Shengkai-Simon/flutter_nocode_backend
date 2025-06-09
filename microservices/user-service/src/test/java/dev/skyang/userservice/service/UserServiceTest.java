package dev.skyang.userservice.service;

import dev.skyang.userservice.client.NotificationServiceClient;
import dev.skyang.userservice.dto.CreateUserRequest;
import dev.skyang.userservice.dto.UserCredentialsResponse;
import dev.skyang.userservice.dto.VerifyEmailRequest;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private NotificationServiceClient notificationServiceClient;

    @InjectMocks
    private UserService userService;

    private User user;
    private CreateUserRequest createUserRequest;

    @BeforeEach
    void setUp() {
        createUserRequest = new CreateUserRequest("test@example.com", "password123");
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setEmailVerificationCode("123456");
        user.setEmailVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
        user.setEmailVerified(false);
        user.setEmailVerificationAttempts(0);
    }

    @Test
    void createUser_success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        // Mock notificationServiceClient if it's called and returns ResponseEntity
        when(notificationServiceClient.sendEmail(any())).thenReturn(ResponseEntity.ok().build());


        User createdUser = userService.createUser(createUserRequest);

        assertNotNull(createdUser);
        assertEquals("test@example.com", createdUser.getEmail());
        assertNotNull(createdUser.getEmailVerificationCode());
        verify(userRepository, times(1)).save(any(User.class));
        verify(notificationServiceClient, times(1)).sendEmail(any());
    }

    @Test
    void createUser_emailAlreadyExists_throwsException() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(createUserRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmail_success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user); // For saving updated user

        boolean result = userService.verifyEmail(new VerifyEmailRequest(user.getEmail(), "123456"));

        assertTrue(result);
        assertTrue(user.isEmailVerified());
        assertEquals(0, user.getEmailVerificationAttempts());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void verifyEmail_alreadyVerified() {
        user.setEmailVerified(true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        boolean result = userService.verifyEmail(new VerifyEmailRequest(user.getEmail(), "123456"));
        assertTrue(result);
        verify(userRepository, never()).save(any(User.class)); // Should not save if already verified
    }


    @Test
    void verifyEmail_invalidCode_incrementsAttempts() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);


        boolean result = userService.verifyEmail(new VerifyEmailRequest(user.getEmail(), "wrongcode"));

        assertFalse(result);
        assertFalse(user.isEmailVerified());
        assertEquals(1, user.getEmailVerificationAttempts());
        assertNotNull(user.getLastEmailVerificationAttemptAt());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void verifyEmail_maxAttemptsExceeded_throwsException() {
        user.setEmailVerificationAttempts(5);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> userService.verifyEmail(new VerifyEmailRequest(user.getEmail(), "123456")));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmail_codeExpired() {
        user.setEmailVerificationCodeExpiresAt(LocalDateTime.now().minusMinutes(1)); // Code expired
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        boolean result = userService.verifyEmail(new VerifyEmailRequest(user.getEmail(), "123456"));

        assertFalse(result);
        assertFalse(user.isEmailVerified());
        assertEquals(1, user.getEmailVerificationAttempts()); // Attempt is still counted
        verify(userRepository, times(1)).save(user);
    }


    @Test
    void getUserCredentialsByEmail_success() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Optional<UserCredentialsResponse> response = userService.getUserCredentialsByEmail(user.getEmail());
        assertTrue(response.isPresent());
        assertEquals(user.getEmail(), response.get().email());
        assertEquals(user.getPasswordHash(), response.get().passwordHash());
    }

    @Test
    void getUserCredentialsByEmail_notFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        Optional<UserCredentialsResponse> response = userService.getUserCredentialsByEmail("unknown@example.com");
        assertFalse(response.isPresent());
    }
    // Add more tests for provider linking, createOrUpdateUserForProvider etc.
}
