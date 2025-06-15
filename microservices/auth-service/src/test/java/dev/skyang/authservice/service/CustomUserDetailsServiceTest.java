package dev.skyang.authservice.service;

import dev.skyang.authservice.dto.UserAuthDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.client.RestClient;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {

    @Mock
    private RestClient restClient;
    @Mock
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @Mock
    private RestClient.RequestHeadersSpec requestHeadersSpec;
    @Mock
    private RestClient.ResponseSpec responseSpec;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    }

    @Test
    @DisplayName("When user-service returns the user, the user details are loaded successfully")
    void shouldLoadUserByUsername_whenUserExists() {
        String existingUserEmail = "user@example.com";
        UserAuthDetails mockDetails = new UserAuthDetails();
        mockDetails.setEmail(existingUserEmail);
        mockDetails.setPassword("hashedPassword");
        mockDetails.setRoles(Set.of("ROLE_USER"));
        mockDetails.setEnabled(true);
        mockDetails.setAccountNonLocked(true);
        mockDetails.setAccountNonExpired(true);
        mockDetails.setCredentialsNonExpired(true);

        when(responseSpec.body(UserAuthDetails.class)).thenReturn(mockDetails);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(existingUserEmail);

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(existingUserEmail);
    }

    @Test
    @DisplayName("If user-service return null，Should throw UsernameNotFoundException")
    void shouldThrowException_whenUserServiceReturnsNull() {
        String nonExistentUserEmail = "not-found@example.com";
        when(responseSpec.body(UserAuthDetails.class)).thenReturn(null);

        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(nonExistentUserEmail))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Error fetching user details for: " + nonExistentUserEmail);
    }
}
