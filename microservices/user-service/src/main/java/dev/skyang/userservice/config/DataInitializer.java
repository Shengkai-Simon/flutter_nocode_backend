package dev.skyang.userservice.config;

import dev.skyang.userservice.model.Role;
import dev.skyang.userservice.model.User;
import dev.skyang.userservice.model.UserStatus;
import dev.skyang.userservice.repository.RoleRepository;
import dev.skyang.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    // <<< Inject the initial administrator's credentials from the configuration file >>>
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // --- Make sure the base role exists ---
            if (roleRepository.findByName(RoleConstants.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(RoleConstants.ROLE_USER));
            }
            Role adminRole;
            if (roleRepository.findByName(RoleConstants.ROLE_ADMIN).isEmpty()) {
                adminRole = roleRepository.save(new Role(RoleConstants.ROLE_ADMIN));
            } else {
                adminRole = roleRepository.findByName(RoleConstants.ROLE_ADMIN).get();
            }

            // --- <<< Review and create an initial administrator account >>> ---
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User adminUser = new User();
                adminUser.setEmail(adminEmail);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));

                // Directly set the status to ACTIVE
                adminUser.setStatus(UserStatus.ACTIVE);

                // Grant the role of Administrator
                Role userRole = roleRepository.findByName(RoleConstants.ROLE_USER).get();
                adminUser.setRoles(Set.of(userRole, adminRole));

                userRepository.save(adminUser);
                System.out.println(">>> Initial admin user created: " + adminEmail);
            }
        };
    }
}
