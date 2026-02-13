package dev.skyang.userservice.config;

public final class ApiPaths {

    private ApiPaths() { }

    // --- Base Paths ---
    public static final String API_BASE = "/api";
    public static final String PUBLIC_SUB_PATH = "/public";

    // --- Public Paths ---
    public static final String PUBLIC_BASE = API_BASE + PUBLIC_SUB_PATH;
    public static final String REGISTER = "/register";
    public static final String VERIFY = "/verify";
    public static final String RESEND_VERIFICATION = "/resend-verification";
    public static final String REQUEST_UNLOCK = "/request-unlock";
    public static final String PERFORM_UNLOCK = "/perform-unlock";
    public static final String FORGOT_PASSWORD = "/forgot-password";
    public static final String RESET_PASSWORD = "/reset-password";

    // --- Protected User Paths ---
    public static final String ME = "/me";

    // --- Admin Paths ---
    public static final String ADMIN_BASE = API_BASE + "/admin";
    public static final String ADMIN_USERS = "/users";
    public static final String ADMIN_USER_ROLES = ADMIN_USERS + "/{userId}/roles";
}
