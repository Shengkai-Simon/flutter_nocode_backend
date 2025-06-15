package dev.skyang.authservice.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.client.RestClient;

import java.util.concurrent.TimeUnit;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoginAttemptService Unit tests")
class LoginAttemptServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private RestClient restClient;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private LoginAttemptService loginAttemptService;

    private final String TEST_EMAIL = "test@example.com";

    @Test
    @DisplayName("You should not lock your account if your login fails and the threshold is not reached")
    void loginFailed_shouldIncrementCountAndNotLockAccount() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("login:attempt:" + TEST_EMAIL)).thenReturn(2L);

        // when
        loginAttemptService.loginFailed(TEST_EMAIL);

        // then
        verify(valueOperations).increment("login:attempt:" + TEST_EMAIL);
        verify(redisTemplate, never()).expire(anyString(), anyLong(), any(TimeUnit.class));
        verify(restClient, never()).post();
    }

    @Test
    @DisplayName("When the login failure reaches the threshold, the account should be locked")
    void loginFailed_shouldLockAccountOnReachingMaxAttempts() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("login:attempt:" + TEST_EMAIL)).thenReturn(5L); // 5 is MAX_ATTEMPTS

        RestClient.RequestBodyUriSpec requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec requestBodySpec = mock(RestClient.RequestBodySpec.class);
        RestClient.ResponseSpec responseSpec = mock(RestClient.ResponseSpec.class);
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString(), anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);

        // when
        loginAttemptService.loginFailed(TEST_EMAIL);

        // then
        verify(valueOperations).increment("login:attempt:" + TEST_EMAIL);
        verify(restClient).post();
        verify(requestBodyUriSpec).uri("/users/{email}/lock", TEST_EMAIL);
    }

    @Test
    @DisplayName("The number of login attempts should be reset when the login is successful")
    void loginSucceeded_shouldResetLoginAttempts() {
        // given
        RestClient.RequestHeadersUriSpec requestHeadersUriSpec = mock(RestClient.RequestHeadersUriSpec.class);
        RestClient.RequestHeadersSpec requestHeadersSpec = mock(RestClient.RequestHeadersSpec.class);
        RestClient.ResponseSpec responseSpec = mock(RestClient.ResponseSpec.class);
        when(restClient.delete()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        // when
        loginAttemptService.loginSucceeded(TEST_EMAIL);

        // then
        verify(restClient).delete();
        verify(requestHeadersUriSpec).uri("/users/{email}/login-attempts", TEST_EMAIL);
    }
}