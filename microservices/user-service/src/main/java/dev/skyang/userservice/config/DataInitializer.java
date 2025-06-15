package dev.skyang.userservice.config;

import dev.skyang.userservice.model.Role;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import dev.skyang.userservice.repository.RoleRepository;
import dev.skyang.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // <<< Inject the initial administrator's credentials from the configuration file >>>
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    @Transactional
    CommandLineRunner initDatabase(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // --- Make sure the base role exists ---
            if (roleRepository.findByName(RoleConstants.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(RoleConstants.ROLE_USER));
                log.info("Initialized role: {}", RoleConstants.ROLE_USER);
            }
            if (roleRepository.findByName(RoleConstants.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(RoleConstants.ROLE_ADMIN));
                log.info("Initialized role: {}", RoleConstants.ROLE_ADMIN);
            }

            // --- <<< Review and create an initial administrator account >>> ---
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                log.info("Creating initial admin user: {}", adminEmail);

                User adminUser = new User();
                adminUser.setEmail(adminEmail);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                adminUser.setStatus(UserStatus.ACTIVE);
                User savedAdmin = userRepository.save(adminUser);

                Role userRole = roleRepository.findByName(RoleConstants.ROLE_USER).get();
                Role adminRole = roleRepository.findByName(RoleConstants.ROLE_ADMIN).get();
                savedAdmin.getRoles().add(userRole);
                savedAdmin.getRoles().add(adminRole);

                // 3. <<< After modifying the collection, explicitly call save() again >>>
                userRepository.save(savedAdmin);

                log.info(">>> Initial admin user created successfully with roles: {}", savedAdmin.getRoles().stream().map(Role::getName).toList());
            }
        };
    }
}
