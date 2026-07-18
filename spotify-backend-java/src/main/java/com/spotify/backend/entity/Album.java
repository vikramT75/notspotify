package com.spotify.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "album")
public class Album {

    @Id
    @JsonProperty("_id")
    private String id = UUID.randomUUID().toString();

    private String name;

    @JsonProperty("desc")
    private String description;

    private String bgColour;

    private String image;

    public Album() {
    }

    public Album(String name, String description, String bgColour, String image) {
        this.name = name;
        this.description = description;
        this.bgColour = bgColour;
        this.image = image;
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

    public String getBgColour() {
        return bgColour;
    }

    public void setBgColour(String bgColour) {
        this.bgColour = bgColour;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
