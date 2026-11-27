package com.spotify.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.ProgressCallback;
import com.cloudinary.Uploader;
import com.cloudinary.strategies.AbstractUploaderStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CloudinaryServiceTest {

    private final List<String> destroyCalls = new ArrayList<>();
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        destroyCalls.clear();
        AbstractUploaderStrategy noOpStrategy = new AbstractUploaderStrategy() {
            @Override
            public Map callApi(String action, Map<String, Object> params, Map options, Object file, ProgressCallback cb) {
                return Map.of("result", "ok");
            }
        };
        Uploader fakeUploader = new Uploader(null, noOpStrategy) {
            @Override
            public Map destroy(String publicId, Map options) {
                destroyCalls.add(publicId + ":" + options.get("resource_type"));
                return Map.of("result", "ok");
            }
        };
        Cloudinary fakeCloudinary = new Cloudinary(Map.of("cloud_name", "test")) {
            @Override
            public Uploader uploader() {
                return fakeUploader;
            }
        };
        cloudinaryService = new CloudinaryService(fakeCloudinary);
    }

    @Test
    void extractPublicIdParsesStandardCloudinaryImageAndAudioUrls() {
        assertEquals(
                "o88neigszz8vxbml1q47",
                cloudinaryService.extractPublicId(
                        "https://res.cloudinary.com/yfpnb9mk/image/upload/v1795794887/o88neigszz8vxbml1q47.jpg"));
        assertEquals(
                "iloknjt2hi6wonlofntt",
                cloudinaryService.extractPublicId(
                        "https://res.cloudinary.com/yfpnb9mk/video/upload/v1795794886/iloknjt2hi6wonlofntt.mp3"));
    }

    @Test
    void extractPublicIdHandlesFoldersTransformationsDotsAndMissingVersion() {
        assertEquals(
                "music/my.cover",
                cloudinaryService.extractPublicId(
                        "https://res.cloudinary.com/demo/image/upload/c_fill,w_200/v123/music/my.cover.png?v=1"));
        assertEquals(
                "tracks/song",
                cloudinaryService.extractPublicId(
                        "https://res.cloudinary.com/demo/video/upload/tracks/song.mp3"));
    }

    @Test
    void extractPublicIdReturnsNullForNonCloudinaryOrBlankUrls() {
        assertNull(cloudinaryService.extractPublicId(null));
        assertNull(cloudinaryService.extractPublicId("   "));
        assertNull(cloudinaryService.extractPublicId("https://example.com/static/song.mp3"));
    }

    @Test
    void deleteByUrlDestroysAssetWithExpectedPublicIdAndResourceType() throws IOException {
        cloudinaryService.deleteByUrl(
                "https://res.cloudinary.com/yfpnb9mk/video/upload/v1795794886/iloknjt2hi6wonlofntt.mp3",
                "video");

        assertEquals(List.of("iloknjt2hi6wonlofntt:video"), destroyCalls);
    }

    @Test
    void deleteFileIgnoresNullOrBlankPublicId() throws IOException {
        cloudinaryService.deleteFile(null, "image");
        cloudinaryService.deleteFile("  ", "image");
        cloudinaryService.deleteByUrl("https://example.com/local.jpg", "image");

        assertTrue(destroyCalls.isEmpty());
    }
}
