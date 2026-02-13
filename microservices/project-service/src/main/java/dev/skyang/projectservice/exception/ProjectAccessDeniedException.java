package dev.skyang.projectservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ProjectAccessDeniedException extends RuntimeException {
    public ProjectAccessDeniedException() {
        super("Access denied. You do not have permission to access this project.");
    }
}