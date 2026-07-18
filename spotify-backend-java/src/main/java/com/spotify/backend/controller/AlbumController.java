package com.spotify.backend.controller;

import com.spotify.backend.entity.Album;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/album")
public class AlbumController {

    private final AlbumRepository albumRepository;
    private final CloudinaryService cloudinaryService;

    public AlbumController(AlbumRepository albumRepository, CloudinaryService cloudinaryService) {
        this.albumRepository = albumRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/add")
    public Map<String, Object> addAlbum(
            @RequestParam("name") String name,
            @RequestParam("desc") String desc,
            @RequestParam("bgColour") String bgColour,
            @RequestParam("image") MultipartFile imageFile) {

        Map<String, Object> response = new HashMap<>();
        try {
            Map uploadResult = cloudinaryService.uploadImage(imageFile);
            String imageUrl = (String) uploadResult.get("secure_url");

            Album album = new Album(name, desc, bgColour, imageUrl);

            albumRepository.save(album);

            response.put("success", true);
            response.put("message", "Album Added");
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }

    @GetMapping("/list")
    public Map<String, Object> listAlbum() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Album> albums = albumRepository.findAll();
            response.put("success", true);
            response.put("albums", albums);
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }

    @PostMapping("/remove")
    public Map<String, Object> removeAlbum(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String id = request.get("id");
            albumRepository.deleteById(id);
            response.put("success", true);
            response.put("message", "Album Removed");
        } catch (Exception e) {
            response.put("success", false);
        }
        return response;
    }
}
