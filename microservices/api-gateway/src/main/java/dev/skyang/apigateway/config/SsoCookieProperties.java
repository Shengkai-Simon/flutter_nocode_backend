package dev.skyang.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.sso")
public class SsoCookieProperties {
    private String cookieName;
    private String domain;
    private int maxAgeSeconds;

    // Getters and Setters
    public String getCookieName() { return cookieName; }
    public void setCookieName(String cookieName) { this.cookieName = cookieName; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public int getMaxAgeSeconds() { return maxAgeSeconds; }
    public void setMaxAgeSeconds(int maxAgeSeconds) { this.maxAgeSeconds = maxAgeSeconds; }
}