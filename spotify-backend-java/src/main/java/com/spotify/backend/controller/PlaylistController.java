package com.spotify.backend.controller;

import com.spotify.backend.entity.Playlist;
import com.spotify.backend.entity.Song;
import com.spotify.backend.entity.User;
import com.spotify.backend.repository.PlaylistRepository;
import com.spotify.backend.repository.SongRepository;
import com.spotify.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/playlist")
@CrossOrigin("*")
public class PlaylistController {

    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository;

    public PlaylistController(PlaylistRepository playlistRepository, UserRepository userRepository, SongRepository songRepository) {
        this.playlistRepository = playlistRepository;
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

    @PostMapping("/create")
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String name = request.get("name");
        String desc = request.get("desc");
        String image = request.getOrDefault("image", "");

        Playlist playlist = new Playlist(name, desc, image, user);
        playlistRepository.save(playlist);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("playlist", playlist);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserPlaylists() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<Playlist> playlists = playlistRepository.findByUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("playlists", playlists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlaylist(@PathVariable String id) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(id);
        if (playlistOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("playlist", playlistOpt.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-song")
    public ResponseEntity<?> addSongToPlaylist(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String playlistId = request.get("playlistId");
        String songId = request.get("songId");

        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        Optional<Song> songOpt = songRepository.findById(songId);

        if (playlistOpt.isEmpty() || songOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Playlist or Song not found");
        }

        Playlist playlist = playlistOpt.get();
        if (!playlist.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        playlist.getSongs().add(songOpt.get());
        playlistRepository.save(playlist);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Song added to playlist");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remove-song")
    public ResponseEntity<?> removeSongFromPlaylist(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String playlistId = request.get("playlistId");
        String songId = request.get("songId");

        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        Optional<Song> songOpt = songRepository.findById(songId);

        if (playlistOpt.isEmpty() || songOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Playlist or Song not found");
        }

        Playlist playlist = playlistOpt.get();
        if (!playlist.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        playlist.getSongs().remove(songOpt.get());
        playlistRepository.save(playlist);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Song removed from playlist");
        return ResponseEntity.ok(response);
    }
}
