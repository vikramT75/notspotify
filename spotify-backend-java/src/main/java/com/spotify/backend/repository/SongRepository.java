package com.spotify.backend.repository;

import com.spotify.backend.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, String> {
    List<Song> findByAlbum(String album);
    List<Song> findByNameContainingIgnoreCase(String name);
    List<Song> findByArtistNameIgnoreCase(String artistName);
    List<Song> findByArtistNameContainingIgnoreCase(String artistName);
}
