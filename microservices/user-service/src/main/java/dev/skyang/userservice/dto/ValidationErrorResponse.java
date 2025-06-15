package dev.skyang.userservice.dto;

/**
 * A DTO that encapsulates a single field validation error message.
 * Use Java Record to simplify your code.
 *
 * @param field   The name of the field where an error occurred
 * @param message Specific error messages
 */
public record ValidationErrorResponse(String field, String message) {
}