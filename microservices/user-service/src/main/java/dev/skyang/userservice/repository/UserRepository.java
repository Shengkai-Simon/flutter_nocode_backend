package dev.skyang.userservice.repository;

import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     * @param email The email to search for.
     * @return An Optional containing the user if found, or empty otherwise.
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds all users with a given status that were created before a specified timestamp.
     * @param status The user status to look for.
     * @param timestamp The cutoff timestamp.
     * @return A list of unverified users.
     */
    List<User> findByStatusAndCreatedAtBefore(UserStatus status, LocalDateTime timestamp);
}
