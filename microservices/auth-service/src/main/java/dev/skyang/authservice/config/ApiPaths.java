package dev.skyang.authservice.config;

public final class ApiPaths {

    private ApiPaths() { }

    // --- Base path ---
    public static final String API_BASE = "/api";
    public static final String PUBLIC_SUB_PATH = "/public";

    // --- Expose the path ---
    public static final String PUBLIC_BASE = API_BASE + PUBLIC_SUB_PATH;
    public static final String LOGIN = "/login";

}
