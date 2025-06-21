package dev.skyang.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import dev.skyang.projectservice.dto.CreateProjectRequest;
import dev.skyang.projectservice.dto.ProjectDetailResponse;
import dev.skyang.projectservice.dto.ProjectSummaryResponse;
import dev.skyang.projectservice.exception.ProjectAccessDeniedException;
import dev.skyang.projectservice.exception.ProjectNotFoundException;
import dev.skyang.projectservice.model.Project;
import dev.skyang.projectservice.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ObjectMapper objectMapper; // Spring Boot auto-configures this bean

    @Transactional
    public ProjectDetailResponse createProject(CreateProjectRequest request, Long userId) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setUserId(userId);
        // Initialize with empty JSON object
        project.setProjectData("{}");

        Project savedProject = projectRepository.save(project);
        return new ProjectDetailResponse(savedProject, objectMapper);
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId).stream()
                .map(ProjectSummaryResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectById(Long projectId, Long userId) {
        Project project = findProjectByIdAndVerifyOwnership(projectId, userId);
        return new ProjectDetailResponse(project, objectMapper);
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = findProjectByIdAndVerifyOwnership(projectId, userId);
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDetailResponse patchProject(Long projectId, JsonPatch patch, Long userId) throws JsonPatchException, IOException {
        // 1. Find the project and verify ownership
        Project project = findProjectByIdAndVerifyOwnership(projectId, userId);

        // 2. Convert current project data from String to JsonNode
        JsonNode currentDataNode = objectMapper.readTree(project.getProjectData());

        // 3. Apply the patch
        JsonNode patchedDataNode = patch.apply(currentDataNode);

        // 4. Convert the patched JsonNode back to a String and save
        project.setProjectData(objectMapper.writeValueAsString(patchedDataNode));
        Project updatedProject = projectRepository.save(project);

        return new ProjectDetailResponse(updatedProject, objectMapper);
    }

    /**
     * A private helper method to find a project and verify its ownership.
     * This centralizes the security check.
     *
     * @param projectId The ID of the project to find.
     * @param userId    The ID of the current authenticated user.
     * @return The found Project entity.
     * @throws ProjectNotFoundException     if the project does not exist.
     * @throws ProjectAccessDeniedException if the user does not own the project.
     */
    private Project findProjectByIdAndVerifyOwnership(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (!project.getUserId().equals(userId)) {
            throw new ProjectAccessDeniedException();
        }

        return project;
    }
}