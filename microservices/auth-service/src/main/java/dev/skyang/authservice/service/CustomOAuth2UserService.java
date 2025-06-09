package dev.skyang.authservice.service;

import dev.skyang.authservice.client.UserServiceClient;
import dev.skyang.authservice.dto.user.CreateOrUpdateUserForProviderRequest;
import dev.skyang.authservice.dto.user.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserServiceClient userServiceClient;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");

        // Some providers might not return email by default or it might be under a different claim
        if (email == null) {
            // Try common alternative claims for email
            if (attributes.containsKey("preferred_username") && ((String)attributes.get("preferred_username")).contains("@")) {
                email = (String) attributes.get("preferred_username");
            } else if (attributes.containsKey("upn") && ((String)attributes.get("upn")).contains("@")) { // Microsoft specific
                email = (String) attributes.get("upn");
            }
            // If email is still null, this provider might not be suitable for direct use or requires specific scope/configuration.
            if (email == null) {
                log.error("Email attribute not found for provider {}. Attributes: {}", userRequest.getClientRegistration().getRegistrationId(), attributes);
                throw new OAuth2AuthenticationException("Email not found from OAuth2 provider " + userRequest.getClientRegistration().getRegistrationId());
            }
        }

        String providerId = oauth2User.getName(); // This is usually the 'sub' (subject) claim
        String provider = userRequest.getClientRegistration().getRegistrationId();

        log.info("Processing OAuth2 user: Email [{}], Provider [{}], ProviderID [{}]", email, provider, providerId);

        CreateOrUpdateUserForProviderRequest request = new CreateOrUpdateUserForProviderRequest(email, provider, providerId);
        ResponseEntity<UserResponse> responseEntity = userServiceClient.createOrUpdateUserFromProvider(request);

        if (!responseEntity.getStatusCode().is2xxSuccessful() || responseEntity.getBody() == null) {
            log.error("Could not create or update user in user-service for provider {}. Response: {}", provider, responseEntity);
            throw new OAuth2AuthenticationException("Could not create or update user in user-service for provider " + provider + ". Status: " + responseEntity.getStatusCode());
        }

        UserResponse userFromService = responseEntity.getBody();
        log.info("User successfully created/updated via user-service: ID [{}], Email [{}]", userFromService.id(), userFromService.email());

        // Use existing authorities from OAuth2User and add custom ones if needed
        Set<GrantedAuthority> authorities = new HashSet<>(oauth2User.getAuthorities());
        // Example: Add a default role for all OAuth2 authenticated users
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        // Potentially add more roles based on userFromService if it contains role information

        // The nameAttributeKey determines what String is returned by Authentication.getName()
        // It should be a key present in the attributes map.
        // Using 'sub' or the provider's standard user ID attribute is common. Email also works if unique.
        String nameAttributeKey = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
        if (!attributes.containsKey(nameAttributeKey)) {
            // Fallback if the configured userNameAttributeName is not in the attributes (e.g. 'sub' for Google)
            nameAttributeKey = "sub"; // Common for many OIDC providers
            if (!attributes.containsKey(nameAttributeKey) && attributes.containsKey("id")) { // Another common one
                 nameAttributeKey = "id";
            } else if (!attributes.containsKey(nameAttributeKey)) { // Default to email if others fail
                nameAttributeKey = "email";
            }
        }

        // Create a new DefaultOAuth2User with potentially modified attributes or authorities
        // Ensure all original attributes are carried over, plus any modifications
        Map<String, Object> newAttributes = new java.util.HashMap<>(attributes);
        newAttributes.put("internal_user_id", userFromService.id().toString()); // Add internal user ID for reference
        newAttributes.put("email_verified_status", userFromService.emailVerified());


        return new DefaultOAuth2User(authorities, newAttributes, nameAttributeKey);
    }
}
