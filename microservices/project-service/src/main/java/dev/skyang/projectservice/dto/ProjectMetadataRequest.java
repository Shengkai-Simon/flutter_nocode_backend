package dev.skyang.projectservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * A unified DTO for creating or updating a project's metadata.
 */
public class ProjectMetadataRequest {

    /**
     * Project name. Required for creation.
     * Allows letters, numbers, spaces, and common punctuation.
     */
    @NotEmpty(message = "Project name cannot be empty.")
    @Size(min = 1, max = 20, message = "Project name must be between 1 and 20 characters long.")
    @Pattern(regexp = "^[a-zA-Z0-9_\\-\\s.,!?']+$", message = "Project name contains invalid characters.")
    private String name;

    /**
     * Project description. Optional.
     */
    @Size(max = 500, message = "Description cannot exceed 500 characters.")
    @Pattern(regexp = "^[\\w\\s.,!?'\"()\\-–—*@#:/\\\\n]*$", message = "Description contains invalid characters.")
    private String description;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}