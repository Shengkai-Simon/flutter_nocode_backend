package dev.skyang.authservice.listener;

import dev.skyang.authservice.service.LoginAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationEventsListener {

    @Autowired
    private LoginAttemptService loginAttemptService;

    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        // When a user successfully logs in, resets its failure count
        String username = event.getAuthentication().getName();
        loginAttemptService.loginSucceeded(username);
    }

    @EventListener
    public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
        // When a user fails to log in due to an incorrect password, increase their failure count
        String username = (String) event.getAuthentication().getPrincipal();
        loginAttemptService.loginFailed(username);
    }
}
