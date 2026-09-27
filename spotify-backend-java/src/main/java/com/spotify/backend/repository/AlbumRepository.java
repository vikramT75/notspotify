package com.spotify.backend.repository;

import com.spotify.backend.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, String> {
    List<Album> findByNameContainingIgnoreCase(String name);
}
