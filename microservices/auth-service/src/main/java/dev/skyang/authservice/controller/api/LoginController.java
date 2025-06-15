package dev.skyang.authservice.controller.api;

import dev.skyang.authservice.config.ApiPaths;
import dev.skyang.authservice.dto.LoginRequest;
import dev.skyang.authservice.dto.LoginResponse;
import dev.skyang.authservice.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.API_BASE)
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    /**
     * Handle user login requests.
     * If successful, the returned LoginResponse will be automatically encapsulated by the GlobalResponseHandler.
     * When it fails (AuthenticationException), it will be caught and handled by the GlobalExceptionHandler.
     */
    @PostMapping(ApiPaths.PUBLIC_SUB_PATH + ApiPaths.LOGIN)
    public LoginResponse login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenService.generateToken(authentication);
        return new LoginResponse(token);
    }
}
