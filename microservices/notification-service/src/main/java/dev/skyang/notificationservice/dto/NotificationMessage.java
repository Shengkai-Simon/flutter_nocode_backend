package dev.skyang.notificationservice.dto;

import java.io.Serializable;

/**
 * DTO for receiving messages from RabbitMQ.
 * Must be Serializable and have a structure identical to the message being sent.
 */
public class NotificationMessage implements Serializable {
    private String to;
    private String subject;
    private String body;

    // A default constructor is required for deserialization
    public NotificationMessage() {
    }

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

    @Override
    public String toString() {
        return "NotificationMessage{" +
                "to='" + to + '\'' +
                ", subject='" + subject + '\'' +
                '}';
    }
}
