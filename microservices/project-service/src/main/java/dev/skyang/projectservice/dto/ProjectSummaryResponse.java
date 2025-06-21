package dev.skyang.projectservice.dto;

import dev.skyang.projectservice.model.Project;

import java.time.LocalDateTime;

// DTO for project list, excluding the large projectData field
public class ProjectSummaryResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime updatedAt;

    public ProjectSummaryResponse(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.updatedAt = project.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}