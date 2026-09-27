package com.spotify.backend.repository;

import com.spotify.backend.entity.Playlist;
import com.spotify.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {
    List<Playlist> findByUser(User user);
}
