package com.spotify.backend.repository;

import com.spotify.backend.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, String> {
    List<Song> findByAlbum(String album);
    List<Song> findByNameContainingIgnoreCase(String name);
    List<Song> findByArtistNameIgnoreCase(String artistName);
    List<Song> findByArtistNameContainingIgnoreCase(String artistName);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_liked_songs WHERE song_id = :songId", nativeQuery = true)
    void deleteLikedSongLinks(@Param("songId") String songId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM playlist_songs WHERE song_id = :songId", nativeQuery = true)
    void deletePlaylistSongLinks(@Param("songId") String songId);
}
