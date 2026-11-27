package com.spotify.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.ProgressCallback;
import com.cloudinary.Uploader;
import com.cloudinary.strategies.AbstractUploaderStrategy;
import com.spotify.backend.entity.Album;
import com.spotify.backend.entity.Song;
import com.spotify.backend.repository.AlbumRepository;
import com.spotify.backend.repository.SongRepository;
import com.spotify.backend.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class SongAndAlbumDeleteControllerTest {

    private final List<String> events = new ArrayList<>();
    private final Map<String, Song> songStore = new LinkedHashMap<>();
    private final Map<String, Album> albumStore = new LinkedHashMap<>();

    private SongController songController;
    private AlbumController albumController;

    @BeforeEach
    void setUp() {
        events.clear();
        songStore.clear();
        albumStore.clear();

        AbstractUploaderStrategy noOpStrategy = new AbstractUploaderStrategy() {
            @Override
            public Map callApi(String action, Map<String, Object> params, Map options, Object file, ProgressCallback cb) {
                return Map.of("result", "ok");
            }
        };
        Uploader fakeUploader = new Uploader(null, noOpStrategy) {
            @Override
            public Map destroy(String publicId, Map options) {
                events.add("cloudinary:" + options.get("resource_type") + ":" + publicId);
                return Map.of("result", "ok");
            }
        };
        Cloudinary fakeCloudinary = new Cloudinary(Map.of("cloud_name", "test")) {
            @Override
            public Uploader uploader() {
                return fakeUploader;
            }
        };
        CloudinaryService cloudinaryService = new CloudinaryService(fakeCloudinary);

        SongRepository songRepository = (SongRepository) Proxy.newProxyInstance(
                SongRepository.class.getClassLoader(),
                new Class<?>[]{SongRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.ofNullable(songStore.get((String) args[0]));
                    case "findByAlbum" -> songStore.values().stream()
                            .filter(s -> Objects.equals(args[0], s.getAlbum()))
                            .toList();
                    case "deleteLikedSongLinks" -> {
                        events.add("unlink-liked:" + args[0]);
                        yield null;
                    }
                    case "deletePlaylistSongLinks" -> {
                        events.add("unlink-playlist:" + args[0]);
                        yield null;
                    }
                    case "deleteById" -> {
                        events.add("db-delete-song:" + args[0]);
                        songStore.remove((String) args[0]);
                        yield null;
                    }
                    case "deleteAll" -> {
                        @SuppressWarnings("unchecked")
                        Iterable<Song> songs = (Iterable<Song>) args[0];
                        for (Song s : songs) {
                            events.add("db-delete-song:" + s.getId());
                            songStore.remove(s.getId());
                        }
                        yield null;
                    }
                    default -> throw new UnsupportedOperationException(method.getName());
                });

        AlbumRepository albumRepository = (AlbumRepository) Proxy.newProxyInstance(
                AlbumRepository.class.getClassLoader(),
                new Class<?>[]{AlbumRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.ofNullable(albumStore.get((String) args[0]));
                    case "deleteById" -> {
                        events.add("db-delete-album:" + args[0]);
                        albumStore.remove((String) args[0]);
                        yield null;
                    }
                    default -> throw new UnsupportedOperationException(method.getName());
                });

        songController = new SongController(songRepository, cloudinaryService);
        albumController = new AlbumController(albumRepository, cloudinaryService, songRepository);
    }

    @Test
    void removeSongDeletesCloudinaryAssetsBeforeDeletingFromDatabase() {
        Song song = new Song(
                "Track", "Desc", "Single",
                "https://res.cloudinary.com/yfpnb9mk/image/upload/v1/cover123.jpg",
                "https://res.cloudinary.com/yfpnb9mk/video/upload/v1/audio456.mp3",
                "3:10", "Artist", "2026-01-01");
        song.setId("song-1");
        songStore.put("song-1", song);

        Map<String, Object> result = songController.removeSong(Map.of("id", "song-1"));

        assertEquals(true, result.get("success"));
        assertFalse(songStore.containsKey("song-1"));
        assertEquals(List.of(
                "cloudinary:video:audio456",
                "cloudinary:image:cover123",
                "unlink-liked:song-1",
                "unlink-playlist:song-1",
                "db-delete-song:song-1"), events);
    }

    @Test
    void removeSongReturnsFailureWhenSongNotFound() {
        Map<String, Object> result = songController.removeSong(Map.of("id", "missing"));

        assertEquals(false, result.get("success"));
        assertEquals("Song not found", result.get("message"));
        assertTrue(events.isEmpty());
    }

    @Test
    void removeAlbumDeletesAlbumAndSongCloudinaryAssetsBeforeDatabaseRows() {
        Album album = new Album(
                "Album", "Desc", "#000000",
                "https://res.cloudinary.com/yfpnb9mk/image/upload/v1/albumimg.jpg",
                "None", "2026-01-01");
        album.setId("album-1");
        albumStore.put("album-1", album);

        Song song = new Song(
                "Track", "Desc", "album-1",
                "https://res.cloudinary.com/yfpnb9mk/image/upload/v1/songimg.jpg",
                "https://res.cloudinary.com/yfpnb9mk/video/upload/v1/songaud.mp3",
                "2:45", "Artist", "2026-01-01");
        song.setId("song-2");
        songStore.put("song-2", song);

        Map<String, Object> result = albumController.removeAlbum(Map.of("id", "album-1"));

        assertEquals(true, result.get("success"));
        assertFalse(albumStore.containsKey("album-1"));
        assertFalse(songStore.containsKey("song-2"));
        assertEquals(List.of(
                "cloudinary:video:songaud",
                "cloudinary:image:songimg",
                "unlink-liked:song-2",
                "unlink-playlist:song-2",
                "cloudinary:image:albumimg",
                "db-delete-song:song-2",
                "db-delete-album:album-1"), events);
    }
}
