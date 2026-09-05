package com.spotify.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "song")
public class Song {

    @Id
    @JsonProperty("_id")
    private String id = UUID.randomUUID().toString();

    private String name;

    @JsonProperty("desc")
    private String description;

    private String album; 

    private String image;

    private String file;

    private String duration;

    private String artistName;

    private String releaseDate;

    public Song() {
    }

    public Song(String name, String description, String album, String image, String file, String duration, String artistName, String releaseDate) {
        this.name = name;
        this.description = description;
        this.album = album;
        this.image = image;
        this.file = file;
        this.duration = duration;
        this.artistName = artistName;
        this.releaseDate = releaseDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getFile() {
        return file;
    }

    public void setFile(String file) {
        this.file = file;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }
}
