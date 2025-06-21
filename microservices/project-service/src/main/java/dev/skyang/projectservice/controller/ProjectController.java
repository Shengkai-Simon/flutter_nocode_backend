package dev.skyang.projectservice.controller;

import com.github.fge.jsonpatch.JsonPatch;
import dev.skyang.projectservice.config.ApiPaths;
import dev.skyang.projectservice.dto.CreateProjectRequest;
import dev.skyang.projectservice.dto.ProjectDetailResponse;
import dev.skyang.projectservice.dto.ProjectSummaryResponse;
import dev.skyang.projectservice.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.API_BASE)
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/projects")
    public ResponseEntity<ProjectDetailResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        ProjectDetailResponse createdProject = projectService.createProject(request, userId);
        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }

    @GetMapping("/projects")
    public List<ProjectSummaryResponse> getUserProjects(@AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        return projectService.getProjectsByUserId(userId);
    }

    @GetMapping("/projects/{id}")
    public ProjectDetailResponse getProjectDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        return projectService.getProjectById(id, userId);
    }

    @DeleteMapping("/projects/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        projectService.deleteProject(id, userId);
    }

    @PatchMapping(path = "/projects/{id}", consumes = "application/json-patch+json")
    public ProjectDetailResponse patchProject(
            @PathVariable Long id,
            @RequestBody JsonPatch patch, // Use the JsonPatch object directly
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        try {
            return projectService.patchProject(id, patch, userId);
        } catch (Exception e) {
            // A more specific exception handling can be done in GlobalExceptionHandler
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to apply patch.", e);
        }
    }
}