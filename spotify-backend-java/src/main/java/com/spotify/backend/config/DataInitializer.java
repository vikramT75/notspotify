package com.spotify.backend.config;

import com.spotify.backend.entity.Role;
import com.spotify.backend.entity.User;
import com.spotify.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // If our default admin does not exist, wipe all users and create the default admin.
        if (userRepository.findByUsername("admin1").isEmpty()) {
            System.out.println("Wiping existing users and creating default admin1 account...");
            userRepository.deleteAll();
            
            User admin = new User("admin1", "admin1@gmail.com", passwordEncoder.encode("admin1"), Role.ADMIN);
            userRepository.save(admin);
            
            System.out.println("Default admin account created successfully.");
        }
    }
}
