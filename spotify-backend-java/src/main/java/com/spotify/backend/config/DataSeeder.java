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
        if (albumRepository.count() == 0) {
            Album album1 = new Album("Top 50 Global", "Your weekly update of the most played tracks", "#2a4365", "https://picsum.photos/200/200?random=1");
            Album album2 = new Album("Top 50 India", "Your weekly update of the most played tracks", "#22543d", "https://picsum.photos/200/200?random=2");
            albumRepository.save(album1);
            albumRepository.save(album2);
            
            if (songRepository.count() == 0) {
                // Pointing to the .mp3 files hosted on the Next.js frontend on port 3000
                Song song1 = new Song("Song One", "Put a smile on your face with these happy tunes", "Top 50 Global", "https://picsum.photos/200/200?random=3", "http://localhost:3000/song1.mp3", "3:00");
                Song song2 = new Song("Song Two", "Put a smile on your face with these happy tunes", "Top 50 India", "https://picsum.photos/200/200?random=4", "http://localhost:3000/song2.mp3", "2:20");
                
                songRepository.save(song1);
                songRepository.save(song2);
            }
        }
    }
}
