package dev.skyang.authservice.controller;

import dev.skyang.authservice.client.UserServiceClient;
import dev.skyang.authservice.dto.RegistrationRequest;
import dev.skyang.authservice.dto.VerifyEmailCodeRequest;
import dev.skyang.authservice.dto.user.CreateUserRequest;
import dev.skyang.authservice.dto.user.UserResponse;
import dev.skyang.authservice.dto.user.VerifyEmailRequest as UserVerifyEmailRequest; // Alias
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerUser_success() {
        RegistrationRequest req = new RegistrationRequest("test@example.com", "pass");
        UserResponse userResp = new UserResponse(UUID.randomUUID(), "test@example.com", false, null, null, null, LocalDateTime.now(), LocalDateTime.now());
        when(userServiceClient.createUser(any(CreateUserRequest.class))).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(userResp));

        ResponseEntity<?> response = authController.registerUser(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void registerUser_userServiceConflict() {
        RegistrationRequest req = new RegistrationRequest("test@example.com", "pass");
        when(userServiceClient.createUser(any(CreateUserRequest.class)))
            .thenThrow(new HttpClientErrorException(HttpStatus.CONFLICT, "Email already in use"));

        ResponseEntity<?> response = authController.registerUser(req);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("email may already be registered"));
    }


    @Test
    void verifyEmail_success() {
        VerifyEmailCodeRequest req = new VerifyEmailCodeRequest("test@example.com", "123456");
        when(userServiceClient.verifyEmail(any(UserVerifyEmailRequest.class))).thenReturn(ResponseEntity.ok().build());
        ResponseEntity<?> response = authController.verifyEmail(req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
