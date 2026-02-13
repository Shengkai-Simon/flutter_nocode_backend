package dev.skyang.userservice.config;

public final class RoleConstants {

    private RoleConstants() {}

    public static final String ROLE_PREFIX = "ROLE_";
    public static final String USER = "USER";
    public static final String ADMIN = "ADMIN";

    public static final String ROLE_USER = ROLE_PREFIX + USER;
    public static final String ROLE_ADMIN = ROLE_PREFIX + ADMIN;
}
