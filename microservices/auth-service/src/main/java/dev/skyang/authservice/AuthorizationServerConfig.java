package dev.skyang.authservice;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.jwk.source.JWKSource;
import dev.skyang.authservice.jose.Jwks;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;

import java.time.Duration;
import java.util.UUID;

@Configuration
public class AuthorizationServerConfig {

    @Bean
    public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
        // define an OAuth2 client in DB, or use InMemoryRegisteredClientRepository for testing
        RegisteredClient client = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("apptmate-client")
                .clientSecret("{noop}secret")
                .scope("read")
                .scope("write")
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .tokenSettings(TokenSettings.builder().accessTokenTimeToLive(Duration.ofHours(1)).build())
                .build();
        return new InMemoryRegisteredClientRepository(client);
        // for production, use JdbcRegisteredClientRepository with jdbcTemplate
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        // generate an RSA key pair, expose JWK Set at /.well-known/jwks.json
        RSAKey rsaKey = Jwks.generateRsa();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:9000")
                .build();
    }
}
