package dev.skyang.userservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.skyang.userservice.dto.GlobalApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        GlobalApiResponse<Object> apiResponse = GlobalApiResponse.error(
                HttpStatus.FORBIDDEN.value(),
                "Access Denied. You do not have the required permissions to access this resource."
        );

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
