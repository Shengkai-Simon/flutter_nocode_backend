package dev.skyang.projectservice.config;

import dev.skyang.projectservice.dto.GlobalApiResponse;
import dev.skyang.projectservice.exception.ProjectAccessDeniedException;
import dev.skyang.projectservice.exception.ProjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice(basePackages = "dev.skyang.projectservice.controller")
public class GlobalExceptionHandler {

    public record ValidationErrorResponse(String field, String message) {}

    /**
     * Handle parameter validation exceptions triggered by @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ValidationErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationErrorResponse(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        GlobalApiResponse<Object> response = new GlobalApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed for request parameters.",
                errors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

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
        // Detailed logs should be kept in a production environment
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected internal error occurred.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}