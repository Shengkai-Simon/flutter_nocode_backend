package dev.skyang.projectservice.repository;

import dev.skyang.projectservice.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Finds all projects owned by a specific user.
     * @param userId The ID of the user.
     * @return A list of projects.
     */
    List<Project> findByUserId(Long userId);
}