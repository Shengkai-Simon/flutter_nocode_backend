package dev.skyang.userservice.dto;

import java.io.Serializable;

/**
 * DTO for sending messages to RabbitMQ for the notification-service.
 * Must be Serializable to be sent over the wire.
 */
public class NotificationMessage implements Serializable {
    private String to;
    private String subject;
    private String body;

    public NotificationMessage(String to, String subject, String body) {
        this.to = to;
        this.subject = subject;
        this.body = body;
    }

    // Getters and Setters
    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
