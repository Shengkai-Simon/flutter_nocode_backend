package dev.skyang.userservice.repository;

import dev.skyang.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByAppleId(String appleId);

    Optional<User> findByMicrosoftId(String microsoftId);
}
