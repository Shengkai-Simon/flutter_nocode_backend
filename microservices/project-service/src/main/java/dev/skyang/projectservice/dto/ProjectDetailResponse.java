package dev.skyang.projectservice.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.skyang.projectservice.model.Project;

import java.time.LocalDateTime;

// DTO for a single project's full details
public class ProjectDetailResponse {
    private Long id;
    private String name;
    private String description;
    private JsonNode projectData; // Return projectData as a proper JSON object
    private LocalDateTime updatedAt;

    public ProjectDetailResponse(Project project, ObjectMapper objectMapper) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.updatedAt = project.getUpdatedAt();
        try {
            if (project.getProjectData() != null && !project.getProjectData().isEmpty()) {
                this.projectData = objectMapper.readTree(project.getProjectData());
            }
        } catch (Exception e) {
            // Handle parsing error, maybe log it and set projectData to null
            this.projectData = null;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JsonNode getProjectData() { return projectData; }
    public void setProjectData(JsonNode projectData) { this.projectData = projectData; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}