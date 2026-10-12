
package com.campus.complainttracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campus.complainttracker.entity.User;
import com.campus.complainttracker.repository.UserRepository;

@Component
public class AdminSetupRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_SETUP_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_SETUP_PASSWORD:}")
    private String adminPassword;

    @Value("${ADMIN_SETUP_NAME:Campus Administrator}")
    private String adminName;

    public AdminSetupRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Do nothing unless setup credentials are supplied.
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "Admin password must contain at least 12 characters."
            );
        }

        String email = adminEmail.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            System.out.println(
                    "Admin setup skipped: this email already exists."
            );
            return;
        }

        User admin = new User();
        admin.setFullName(adminName.trim());
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");

        userRepository.save(admin);

        System.out.println(
                "Admin account created successfully for: " + email
        );
    }
}
