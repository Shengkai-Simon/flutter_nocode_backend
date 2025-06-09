package dev.skyang.authservice.client;

import dev.skyang.authservice.dto.user.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@FeignClient(name = "user-service", path = "/users")
public interface UserServiceClient {
    @PostMapping
    ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request);

    @PostMapping("/verify-email")
    ResponseEntity<Void> verifyEmail(@RequestBody VerifyEmailRequest request);

    @GetMapping("/email/{email}")
    ResponseEntity<UserResponse> getUserByEmail(@PathVariable("email") String email);

    @GetMapping("/provider/{provider}/{providerId}")
    ResponseEntity<UserResponse> getUserByProviderId(@PathVariable("provider") String provider, @PathVariable("providerId") String providerId);

    @PutMapping("/{id}/link-provider")
    ResponseEntity<UserResponse> linkProvider(@PathVariable("id") UUID id, @RequestBody LinkProviderRequest request);

    @PostMapping("/provider-user")
    ResponseEntity<UserResponse> createOrUpdateUserFromProvider(@RequestBody CreateOrUpdateUserForProviderRequest request);

    @GetMapping("/email/{email}/credentials")
    ResponseEntity<UserCredentialsResponse> getUserCredentials(@PathVariable("email") String email);
}
