package com.spotify.backend.controller;

import com.spotify.backend.entity.Album;
import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.repository.SongRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
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
        // Search by song name OR artist name (deduplicated by id)
        List<Song> byName = songRepository.findByNameContainingIgnoreCase(query);
        List<Song> byArtist = songRepository.findByArtistNameContainingIgnoreCase(query);
        Map<String, Song> songMap = new LinkedHashMap<>();
        for (Song s : byName) songMap.put(s.getId(), s);
        for (Song s : byArtist) songMap.put(s.getId(), s);
        List<Song> songs = new ArrayList<>(songMap.values());

        List<Album> albums = albumRepository.findByNameContainingIgnoreCase(query);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("songs", songs);
        response.put("albums", albums);

        return ResponseEntity.ok(response);
    }
}
