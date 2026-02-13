package dev.skyang.notificationservice.service;

import dev.skyang.notificationservice.dto.NotificationMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false) // Set to false to allow running without mail bean configuration
    private JavaMailSender mailSender;

    public void sendEmail(NotificationMessage notificationMessage) {
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Printing email to console instead.");
            log.info("=================================================");
            log.info("To: {}", notificationMessage.getTo());
            log.info("Subject: {}", notificationMessage.getSubject());
            log.info("Body: {}", notificationMessage.getBody());
            log.info("=================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notificationMessage.getTo());
            message.setSubject(notificationMessage.getSubject());
            message.setText(notificationMessage.getBody());
            // In a real scenario, you would set the "from" address from your configuration
            // message.setFrom("no-reply@yourdomain.com");

            // Uncomment the line below to send a real email
            // mailSender.send(message);

            log.info("Successfully sent email to {}", notificationMessage.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to {}", notificationMessage.getTo(), e);
        }
    }
}
