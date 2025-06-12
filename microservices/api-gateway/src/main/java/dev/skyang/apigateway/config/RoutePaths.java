package dev.skyang.apigateway.config;

public final class RoutePaths {

    private RoutePaths() { }

    public static final String ACTUATOR_PATH = "/actuator/**";

    // --- Public Path Patterns ---
    // Match the /api/public/** path under any service
    public static final String ALL_SERVICES_PUBLIC_API = "/*/api/public/**";

    // --- Service-specific Public Paths (As a special case) ---
    public static final String AUTH_SERVICE_LOGIN = "/auth-service/api/public/login";
}
