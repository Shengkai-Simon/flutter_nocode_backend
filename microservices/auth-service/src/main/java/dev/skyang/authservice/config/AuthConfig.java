package dev.skyang.authservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AuthConfig {

    /**
     * Defines the RestClient bean that other services will use for communication.
     * It's configured with a base URL pointing to the user-service.
     * The service name 'user-service' will be resolved by Eureka thanks to load balancing.
     * @return A configured RestClient instance.
     */
    @Bean
    @LoadBalanced // This annotation is crucial for enabling client-side load balancing with Eureka
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder
                .baseUrl("http://user-service/api/internal")
                .build();
    }

    /**
     * Defines the password encoder bean.
     * It must be the same encoder used in the user-service (BCrypt).
     * @return A PasswordEncoder instance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
