package com.spotify.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// Load .env if it exists
		if (Files.exists(Paths.get(".env"))) {
			Dotenv dotenv = Dotenv.configure().load();
			dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
		}
		SpringApplication.run(BackendApplication.class, args);
	}

}
