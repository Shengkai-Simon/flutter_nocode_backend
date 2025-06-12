package dev.skyang.userservice.config;

import dev.skyang.userservice.dto.GlobalApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice(basePackages = "dev.skyang.userservice.controller.api")
public class GlobalResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // We want to wrap all responses.
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {

        // If the response is already a GlobalApiResponse, do nothing.
        // This is useful for error handlers that might manually create a GlobalApiResponse.
        if (body instanceof GlobalApiResponse) {
            return body;
        }

        // For all other successful responses, wrap them in GlobalApiResponse.
        return GlobalApiResponse.success(body);
    }
}
