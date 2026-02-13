package dev.skyang.authservice.config;

import dev.skyang.authservice.dto.GlobalApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "dev.skyang.authservice.controller.api")
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * <<< Specializes in handling account lock exceptions >>>
     * This handler will be called before the generic AuthenticationException handler.
     */
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleLockedException(LockedException ex) {
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User account is locked.");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * <<< Specializes in handling password error exceptions >>>
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex) {
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Invalid credentials provided.");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * <<< as a general-purpose standby processor >>> for other authentication anomalies
     * Handle authentication issues other than lockouts and password errors (e.g., account disables, expirations, etc.).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleAuthenticationException(AuthenticationException ex) {
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Authentication failed: " + ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle all other uncaught server internal exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleAllExceptions(Exception ex) {
        // In a production environment, detailed error logs should be recorded here
         log.error("Unhandled exception occurred", ex);
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected error occurred.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
