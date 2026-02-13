package dev.skyang.notificationservice.listener;

import dev.skyang.notificationservice.dto.NotificationMessage;
import dev.skyang.notificationservice.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EmailListener {

    private static final Logger log = LoggerFactory.getLogger(EmailListener.class);

    @Autowired
    private EmailService emailService;

    /**
     * Listens for messages on the "email.queue".
     * @param message The deserialized message object from the queue.
     */
    @RabbitListener(queues = "email.queue")
    public void handleEmailMessage(NotificationMessage message) {
        log.info("Received message from email.queue: {}", message);
        emailService.sendEmail(message);
    }
}
