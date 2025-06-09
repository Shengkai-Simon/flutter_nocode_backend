package dev.skyang.userservice.client;

import dev.skyang.userservice.dto.notification.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", path = "/notifications") // Assuming notification-service is registered with this name
public interface NotificationServiceClient {
    @PostMapping("/email")
    ResponseEntity<Void> sendEmail(@RequestBody NotificationRequest request);
}
