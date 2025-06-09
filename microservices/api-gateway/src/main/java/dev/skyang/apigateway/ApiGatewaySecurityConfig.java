package dev.skyang.apigateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;  // enable reactive security
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;

@Configuration
@EnableWebFluxSecurity
public class ApiGatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // use lambda DSL to disable CSRF (csrf() deprecated in 6.1)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/actuator/**").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                // use reactive adapter for JwtAuthenticationConverter
                                .jwtAuthenticationConverter(jwtConverter())
                        )
                );
        return http.build();
    }

    private Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtConverter() {
        JwtAuthenticationConverter delegate = new JwtAuthenticationConverter();
        // wrap into reactive adapter
        return new ReactiveJwtAuthenticationConverterAdapter(delegate);
    }
}
