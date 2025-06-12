package dev.skyang.userservice.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<? extends GrantedAuthority> authorities = extractAuthoritiesFromScope(jwt);
        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaimAsString("sub"));
    }

    private Collection<? extends GrantedAuthority> extractAuthoritiesFromScope(Jwt jwt) {
        String scopeClaim = jwt.getClaimAsString("scope");

        if (!StringUtils.hasText(scopeClaim)) {
            // If there is no scope/authorities claim in the token, an empty list of permissions is returned
            return Collections.emptySet();
        }

        return Arrays.stream(scopeClaim.split(" "))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());

    }
}
