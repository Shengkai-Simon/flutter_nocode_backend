package dev.skyang.authservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);
    private static final int MAX_ATTEMPTS = 5; // The maximum number of failures allowed
    private static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RestClient restClient;

    public void loginSucceeded(String email) {
        // If the login is successful, the interface that calls user-service deletes the failure count in Redis
        try {
            restClient.delete()
                    .uri("/users/{email}/login-attempts", email)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Login attempts reset for user: {}", email);
        } catch (Exception e) {
            log.error("Could not reset login attempts for user {}. Reason: {}", email, e.getMessage());
        }
    }

    public void loginFailed(String email) {
        String key = LOGIN_ATTEMPT_PREFIX + email;

        // Increase the number of failures
        Long attempts = redisTemplate.opsForValue().increment(key);

        // Set an expiration time, such as 24 hours, in case of permanent recording
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, 24, TimeUnit.HOURS);
        }

        log.warn("Failed login attempt for user: {}. Attempt count: {}", email, attempts);

        if (attempts != null && attempts >= MAX_ATTEMPTS) {
            log.error("User {} has exceeded the maximum number of login attempts. Locking account.", email);
            // When the threshold is reached, call the user-service interface to lock the account
            try {
                restClient.post()
                        .uri("/users/{email}/lock", email)
                        .retrieve()
                        .toBodilessEntity();
                log.info("Successfully sent lock request for user: {}", email);
            } catch (Exception e) {
                log.error("Could not send lock request for user {}. Reason: {}", email, e.getMessage());
            }
        }
    }
}
