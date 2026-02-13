package dev.skyang.userservice.config;

import dev.skyang.userservice.dto.GlobalApiResponse;
import dev.skyang.userservice.dto.ValidationErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice(basePackages = "dev.skyang.userservice.controller.api")
public class GlobalExceptionHandler {

    /**
     * Handles business logic exceptions (e.g., user already exists).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleIllegalStateException(IllegalStateException ex) {
        // For client errors like this, we return a 400 Bad Request.
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles validation exceptions (@Valid).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Collect error information from all fields into a single list<ValidationErrorResponse>
        List<ValidationErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationErrorResponse(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        // Returns the List with all validation errors as data
        GlobalApiResponse<Object> response = new GlobalApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Failed to verify the input parameters", // A general reminder
                errors // A specific, fixed-structure list of error details
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }


    /**
     * A generic handler for all other exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalApiResponse<Object>> handleAllExceptions(Exception ex) {
        // For unexpected server errors, we return a 500 Internal Server Error.
        GlobalApiResponse<Object> response = GlobalApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected error occurred.");
        // It's also a good practice to log the full exception here.
        // log.error("Unhandled exception occurred", ex);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
