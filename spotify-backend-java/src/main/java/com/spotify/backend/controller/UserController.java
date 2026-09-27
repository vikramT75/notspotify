package com.spotify.backend.controller;

import com.spotify.backend.entity.Song;
import com.spotify.backend.entity.User;
import com.spotify.backend.repository.SongRepository;
import com.spotify.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    private final UserRepository userRepository;
    private final SongRepository songRepository;

    public UserController(UserRepository userRepository, SongRepository songRepository) {
        this.userRepository = userRepository;
        this.songRepository = songRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.orElse(null);
    }

    @GetMapping("/liked-songs")
    public ResponseEntity<?> getLikedSongs() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("likedSongs", user.getLikedSongs());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/like-song")
    public ResponseEntity<?> likeSong(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String songId = request.get("songId");
        Optional<Song> songOpt = songRepository.findById(songId);
        
        if (songOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Song not found");
        }

        user.getLikedSongs().add(songOpt.get());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Song liked");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unlike-song")
    public ResponseEntity<?> unlikeSong(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String songId = request.get("songId");
        Optional<Song> songOpt = songRepository.findById(songId);
        
        if (songOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Song not found");
        }

        user.getLikedSongs().remove(songOpt.get());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Song unliked");
        return ResponseEntity.ok(response);
    }
}
