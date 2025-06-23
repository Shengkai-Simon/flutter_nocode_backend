package dev.skyang.apigateway.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class CookieAuthenticationConverter implements ServerAuthenticationConverter {

    @Autowired
    private SsoCookieProperties ssoCookieProperties;

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        // Get a cookie named "authToken" from the request
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst(ssoCookieProperties.getCookieName());

        // If the cookie exists and the value is not empty
        if (cookie != null && StringUtils.hasText(cookie.getValue())) {
            // Obtain the token string
            String token = cookie.getValue();
            // Wrap it as a BearerTokenAuthenticationToken object
            return Mono.just(new BearerTokenAuthenticationToken(token));
        }

        // If no cookie is found, an empty Mono is returned, indicating that there is no authentication information
        return Mono.empty();
    }
}