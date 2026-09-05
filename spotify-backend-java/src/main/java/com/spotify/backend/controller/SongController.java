package com.spotify.backend.controller;

import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.SongRepository;
import com.spotify.backend.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/song")
public class SongController {

    private final SongRepository songRepository;
    private final CloudinaryService cloudinaryService;

    public SongController(SongRepository songRepository, CloudinaryService cloudinaryService) {
        this.songRepository = songRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/add")
    public Map<String, Object> addSong(
            @RequestParam("name") String name,
            @RequestParam("desc") String desc,
            @RequestParam("album") String album,
            @RequestParam("artistName") String artistName,
            @RequestParam("releaseDate") String releaseDate,
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("audio") MultipartFile audioFile) {

        Map<String, Object> response = new HashMap<>();
        try {
            Map audioUpload = cloudinaryService.uploadAudio(audioFile);
            Map imageUpload = cloudinaryService.uploadImage(imageFile);

            String audioUrl = (String) audioUpload.get("secure_url");
            String imageUrl = (String) imageUpload.get("secure_url");

            // Duration is sometimes returned as a Double or Integer depending on the file
            Object durationObj = audioUpload.get("duration");
            double durationNum = 0;
            if (durationObj instanceof Number) {
                durationNum = ((Number) durationObj).doubleValue();
            } else if (durationObj instanceof String) {
                durationNum = Double.parseDouble((String) durationObj);
            }

            int minutes = (int) Math.floor(durationNum / 60);
            int seconds = (int) Math.floor(durationNum % 60);
            String duration = minutes + ":" + seconds;

            Song song = new Song(name, desc, album, imageUrl, audioUrl, duration, artistName, releaseDate);

            songRepository.save(song);

            response.put("success", true);
            response.put("message", "Song Added");
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }

    @GetMapping("/list")
    public Map<String, Object> listSong() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Song> songs = songRepository.findAll();
            response.put("success", true);
            response.put("songs", songs);
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }

    @PostMapping("/remove")
    public Map<String, Object> removeSong(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String id = request.get("id");
            songRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Song Remove");
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }
}
