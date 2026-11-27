package com.spotify.backend.controller;

import com.spotify.backend.entity.Album;
import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.repository.SongRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SearchControllerTest {

    private SongRepository songRepository;
    private AlbumRepository albumRepository;
    private SearchController searchController;

    @BeforeEach
    void setUp() {
        songRepository = mock(SongRepository.class);
        albumRepository = mock(AlbumRepository.class);
        searchController = new SearchController(songRepository, albumRepository);
    }

    @Test
    @SuppressWarnings("unchecked")
    void searchDeduplicatesSongsMatchingBothNameAndArtistAndIncludesAlbums() {
        Song shared = new Song("Nova", "Desc", "Single", "img1", "file1", "3:00", "Nova Band", "2026-01-01");
        shared.setId("song-1");
        Song second = new Song("Orbit", "Desc", "Single", "img2", "file2", "2:40", "Nova Band", "2026-01-02");
        second.setId("song-2");

        Album album = new Album("Nova Nights", "Desc", "#111111", "albImg", "None", "2026-01-01");
        album.setId("album-1");

        when(songRepository.findByNameContainingIgnoreCase("nova")).thenReturn(List.of(shared));
        when(songRepository.findByArtistNameContainingIgnoreCase("nova")).thenReturn(List.of(shared, second));
        when(albumRepository.findByNameContainingIgnoreCase("nova")).thenReturn(List.of(album));

        ResponseEntity<?> response = searchController.search("nova");

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));

        List<Song> songs = (List<Song>) body.get("songs");
        List<Album> albums = (List<Album>) body.get("albums");
        assertEquals(2, songs.size());
        assertEquals(List.of("song-1", "song-2"), songs.stream().map(Song::getId).toList());
        assertEquals(1, albums.size());
        assertEquals("album-1", albums.get(0).getId());
    }
}
