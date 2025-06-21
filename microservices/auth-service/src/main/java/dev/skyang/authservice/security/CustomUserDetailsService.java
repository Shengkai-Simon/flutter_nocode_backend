package dev.skyang.authservice.security;

import dev.skyang.authservice.dto.UserAuthDetails;
import dev.skyang.authservice.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private RestClient restClient;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // In our system, 'username' is the user's email address
        try {
            // Call the user-service internal API to obtain user details
            UserAuthDetails userAuthDetails = restClient.get()
                    .uri("/users/{email}", username)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(UserAuthDetails.class);

            if (userAuthDetails == null) {
                throw new UsernameNotFoundException("User not found: " + username);
            }

            // Convert the collection of role strings obtained from user-service to Spring Security's collection of GrantedAuthority objects
            Set<String> roles = userAuthDetails.getRoles() != null ? userAuthDetails.getRoles() : Collections.emptySet();
            Collection<? extends GrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // Use the information you get to create a UserDetails object for Spring Security
            return new CustomUserDetails(
                    userAuthDetails.getId(),
                    userAuthDetails.getEmail(),
                    userAuthDetails.getPassword(),
                    userAuthDetails.isEnabled(),
                    userAuthDetails.isAccountNonExpired(),
                    userAuthDetails.isCredentialsNonExpired(),
                    userAuthDetails.isAccountNonLocked(),
                    authorities // Use the converted set of permissions
            );
        } catch (Exception e) {
            throw new UsernameNotFoundException("Error fetching user details for: " + username, e);
        }
    }
}
