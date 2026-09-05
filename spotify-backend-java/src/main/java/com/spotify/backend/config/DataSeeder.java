package com.spotify.backend.config;

import com.spotify.backend.entity.Album;
import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.repository.SongRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AlbumRepository albumRepository;
    private final SongRepository songRepository;

    public DataSeeder(AlbumRepository albumRepository, SongRepository songRepository) {
        this.albumRepository = albumRepository;
        this.songRepository = songRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Removed hardcoded songs and albums to start with a clean database.
    }
}
