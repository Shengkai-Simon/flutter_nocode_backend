package dev.skyang.authservice.service;

import dev.skyang.authservice.client.UserServiceClient;
import dev.skyang.authservice.dto.user.UserCredentialsResponse; // Correct DTO
import dev.skyang.authservice.dto.user.UserResponse; // Keep for potential future use to get emailVerified status
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.ArrayList; // For authorities
import java.util.Collections; // For authorities if none are defined

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserServiceClient userServiceClient;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Attempting to load user credentials by email: {}", email);
        try {
            // Step 1: Fetch credentials (which includes the password hash)
            ResponseEntity<UserCredentialsResponse> credentialsResponse = userServiceClient.getUserCredentials(email);

            if (!credentialsResponse.getStatusCode().is2xxSuccessful() || credentialsResponse.getBody() == null) {
                log.warn("User not found or error fetching credentials for email: {}. Status: {}", email, credentialsResponse.getStatusCode());
                throw new UsernameNotFoundException("User not found or error fetching credentials for email: " + email);
            }

            UserCredentialsResponse credentials = credentialsResponse.getBody();
            log.debug("Successfully fetched credentials for email: {}", email);

            // Step 2: Check if email is verified.
            // UserCredentialsResponse does not contain emailVerified status.
            // This requires a separate call to get full user details or enhancing UserCredentialsResponse.
            // For now, this check is OMITTED here. It should be handled:
            //   a) By enhancing UserCredentialsResponse to include 'emailVerified'. (Preferred for efficiency)
            //   b) By making a second call to userServiceClient.getUserByEmail(email). (Less efficient)
            //   c) By the login controller/flow before attempting authentication.
            // If not checked, a user could potentially log in with an unverified email if they know their password.
            // Spring Security's User object constructor takes 'enabled' which can be tied to 'emailVerified'.
            // For this subtask, we'll assume 'enabled' is true if credentials are found.
            // This is a simplifying assumption.
            boolean isEmailVerified = true; // Placeholder: Assume true if credentials exist. NEEDS REFINEMENT.

            // Fetch full user details to check emailVerified status
            // This is an extra call, ideally UserCredentialsResponse would include this
            try {
                ResponseEntity<UserResponse> userDetailsResponse = userServiceClient.getUserByEmail(email);
                if (userDetailsResponse.getStatusCode().is2xxSuccessful() && userDetailsResponse.getBody() != null) {
                    isEmailVerified = userDetailsResponse.getBody().emailVerified();
                    if (!isEmailVerified) {
                        log.warn("Login attempt for user {} whose email is not verified.", email);
                        // Throwing exception here will prevent login by DaoAuthenticationProvider
                        throw new UsernameNotFoundException("User email " + email + " is not verified.");
                    }
                    log.debug("User {} email verification status: {}", email, isEmailVerified);
                } else {
                    log.warn("Could not fetch full user details to check email verification for {}, proceeding with caution.", email);
                    // Decide on fallback: either fail (safer) or proceed (as per previous logic).
                    // For now, let's be strict if the call fails to get verification status.
                    throw new UsernameNotFoundException("Could not determine email verification status for user: " + email);
                }
            } catch (Exception e) {
                log.error("Error fetching full user details for email verification check for {}: {}", email, e.getMessage(), e);
                throw new UsernameNotFoundException("Error checking email verification status for user: " + email, e);
            }


            // Using Spring Security's User.
            // Parameters: username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities
            return new User(credentials.email(), credentials.passwordHash(),
                            isEmailVerified, // enabled (linked to email verification)
                            true, // accountNonExpired
                            true, // credentialsNonExpired
                            true, // accountNonLocked
                            Collections.emptyList()); // authorities (fetch if/when roles are implemented)

        } catch (UsernameNotFoundException e) {
            // Re-throw specific exceptions if needed for specific handling upstream
            throw e;
        } catch (Exception e) {
            log.error("Exception while fetching user details for email: " + email, e);
            throw new UsernameNotFoundException("Error fetching user details for email: " + email, e);
        }
    }
}
