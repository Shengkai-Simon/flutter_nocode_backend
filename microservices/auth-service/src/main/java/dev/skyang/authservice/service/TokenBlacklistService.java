package dev.skyang.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * Add JWTs to the blacklist
     * @param jwt JWT objects to be voided
     */
    public void blacklist(Jwt jwt) {
        String jti = jwt.getId();
        Instant expiresAt = jwt.getExpiresAt();
        Instant now = Instant.now();

        // Calculate the remaining valid time
        if (expiresAt != null && expiresAt.isAfter(now)) {
            Duration remainingTime = Duration.between(now, expiresAt);
            // Deposit jti into Redis and set the remaining expiration time
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jti, "blacklisted", remainingTime);
        }
    }

    /**
     * Check if the JWT is on the blacklist
     * @param jti JWT ID
     * @return If it is in the blacklist, it returns true
     */
    public boolean isBlacklisted(String jti) {
        return redisTemplate.hasKey(BLACKLIST_PREFIX + jti);
    }
}