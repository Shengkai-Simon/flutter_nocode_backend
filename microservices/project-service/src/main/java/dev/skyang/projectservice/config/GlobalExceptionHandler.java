package dev.skyang.projectservice.config;

import dev.skyang.projectservice.dto.GlobalApiResponse; // Assuming you copy this from user-service
import dev.skyang.projectservice.exception.ProjectAccessDeniedException;
import dev.skyang.projectservice.exception.ProjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Note: You would need to copy the GlobalApiResponse DTO from user-service
// to make this class compile.

@RestControllerAdvice(basePackages = "dev.skyang.projectservice.controller")
public class GlobalExceptionHandler {

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleProjectNotFound(ProjectNotFoundException ex) {
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProjectAccessDeniedException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleProjectAccessDenied(ProjectAccessDeniedException ex) {
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.FORBIDDEN.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleAllExceptions(Exception ex) {
        // Log the exception ex.printStackTrace();
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected internal error occurred.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}