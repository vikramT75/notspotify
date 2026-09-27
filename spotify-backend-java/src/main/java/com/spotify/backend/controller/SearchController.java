package com.spotify.backend.controller;

import com.spotify.backend.entity.Album;
import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.repository.SongRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin("*")
public class SearchController {

    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;

    public SearchController(SongRepository songRepository, AlbumRepository albumRepository) {
        this.songRepository = songRepository;
        this.albumRepository = albumRepository;
    }

    @GetMapping
    public ResponseEntity<?> search(@RequestParam String query) {
        List<Song> songs = songRepository.findByNameContainingIgnoreCase(query);
        List<Album> albums = albumRepository.findByNameContainingIgnoreCase(query);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("songs", songs);
        response.put("albums", albums);

        return ResponseEntity.ok(response);
    }
}
