package dev.skyang.userservice.controller.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.skyang.userservice.dto.RegistrationRequest;
import dev.skyang.userservice.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(UserControllerTest.TestSecurityConfig.class)
@DisplayName("UserController Unit tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("POST /api/public/register - Successful registration")
    void shouldRegisterUserSuccessfully() throws Exception {
        // given
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        doNothing().when(userService).register(any(RegistrationRequest.class));

        // when & then
        mockMvc.perform(post("/api/public/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.message").value("Registration successful. Please check your email for verification code."));
    }

    @Test
    @DisplayName("POST /api/public/register - email Invalid causes the request to fail")
    void shouldFailRegistrationWhenEmailIsInvalid() throws Exception {
        // given
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("invalid-email");
        request.setPassword("password123");

        // when & then
        mockMvc.perform(post("/api/public/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // JSR 303 validation should fail
    }

    @Test
    @DisplayName("POST /api/public/register - An error is returned when the user already exists")
    void shouldReturnErrorWhenUserAlreadyExists() throws Exception {
        // given
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("exists@example.com");
        request.setPassword("password123");

        doThrow(new IllegalStateException("User with email exists@example.com already exists and is active."))
                .when(userService).register(any(RegistrationRequest.class));

        // when & then
        mockMvc.perform(post("/api/public/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Assuming GlobalExceptionHandler maps IllegalStateException to 400
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            // Disable CSRF in the test environment
            http.csrf(AbstractHttpConfigurer::disable);
            return http.build();
        }
    }
}