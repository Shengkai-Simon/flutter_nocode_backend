package dev.skyang.userservice.service;

import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import dev.skyang.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledCleanupService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledCleanupService.class);

    // Clear accounts that have not been active for more than 7 days
    private static final int EXPIRATION_DAYS = 7;

    @Autowired
    private UserRepository userRepository;

    /**
     * This task runs once every day at 3:00 AM server time.
     * The cron expression is "second minute hour day-of-month month day-of-week".
     * It finds and deletes unverified user accounts that are older than EXPIRATION_DAYS.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupUnverifiedUsers() {
        log.info("Starting scheduled cleanup of unverified users...");

        LocalDateTime expirationTime = LocalDateTime.now().minusDays(EXPIRATION_DAYS);

        List<User> expiredUsers = userRepository.findByStatusAndCreatedAtBefore(
                UserStatus.AWAITING_VERIFICATION,
                expirationTime
        );

        if (expiredUsers.isEmpty()) {
            log.info("No expired unverified users found to clean up.");
            return;
        }

        log.warn("Found {} expired unverified users created before {}. Deleting them now...", expiredUsers.size(), expirationTime);

        userRepository.deleteAll(expiredUsers);

        log.info("Finished scheduled cleanup. {} users were deleted.", expiredUsers.size());
    }
}
