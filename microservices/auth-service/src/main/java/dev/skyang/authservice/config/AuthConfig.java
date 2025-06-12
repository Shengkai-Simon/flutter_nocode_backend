package dev.skyang.authservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

@Configuration
public class AuthConfig {

    @Value("${app.security.internal-api-key.primary}")
    private String primaryInternalApiKey;

    /**
     * <<< Step 1: Define a RestClient Builder that supports load balancing >>>
     * This @LoadBalanced annotation is crucial because it integrates with Eureka service discovery.
     */
    @Bean
    @LoadBalanced
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    /**
     * <<< Step 2: Use the Builder configured above to create the final RestClient instance >>>
     * injected RestClient.Builder, which already supports load balancing, with method arguments.
     * @param restClientBuilder A configured builder provided by Spring.
     * @return A full-featured RestClient that supports service discovery and default request headers.
     */
    @Bean
    public RestClient restClient(RestClient.Builder restClientBuilder) {
        return restClientBuilder
                .baseUrl("http://user-service/api/internal")
                .defaultHeader("X-Internal-API-Key", this.primaryInternalApiKey)
                .build();
    }

    /**
     * Define a password encoder bean.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
