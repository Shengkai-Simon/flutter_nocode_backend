package dev.skyang.projectservice.controller;

import com.github.fge.jsonpatch.JsonPatch;
import dev.skyang.projectservice.config.ApiPaths;
import dev.skyang.projectservice.dto.ProjectDetailResponse;
import dev.skyang.projectservice.dto.ProjectMetadataRequest;
import dev.skyang.projectservice.dto.ProjectSummaryResponse;
import dev.skyang.projectservice.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetailResponse createProject(
            @Valid @RequestBody ProjectMetadataRequest request,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        return projectService.createProject(request, userId);
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

    @PatchMapping("/projects/{id}")
    public ProjectDetailResponse updateProjectMetadata(
            @PathVariable Long id,
            @Valid @RequestBody ProjectMetadataRequest request,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        return projectService.updateProjectMetadata(id, request, userId);
    }

    @PatchMapping(path = "/projects/{id}/data", consumes = "application/json-patch+json")
    public ProjectDetailResponse patchProjectData(
            @PathVariable Long id,
            @RequestBody JsonPatch patch,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = principal.getClaim("uid");
        try {
            return projectService.patchProjectData(id, patch, userId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to apply patch.", e);
        }
    }
}