package com.spotify.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CloudinaryService {

    private static final String UPLOAD_MARKER = "/upload/";
    private static final Pattern VERSION_PREFIX_PATTERN = Pattern.compile("(?:^|.*/)v\\d+/(.+)");

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map uploadImage(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "image"));
    }

    public Map uploadAudio(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "video"));
    }

    /**
     * Deletes a single Cloudinary asset by its public ID and resource type ("image" or "video").
     */
    public void deleteFile(String publicId, String resourceType) throws IOException {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
    }

    /**
     * Extracts the Cloudinary public ID from an upload URL and deletes the asset if valid.
     */
    public void deleteByUrl(String url, String resourceType) throws IOException {
        String publicId = extractPublicId(url);
        if (publicId != null) {
            deleteFile(publicId, resourceType);
        }
    }

    /**
     * Deletes a song's audio ("video") and cover ("image") assets from Cloudinary.
     */
    public void deleteSongAssets(String audioUrl, String imageUrl) throws IOException {
        deleteByUrl(audioUrl, "video");
        deleteByUrl(imageUrl, "image");
    }

    /**
     * Parses a Cloudinary upload URL into its asset public ID (without version prefix or extension).
     */
    public String extractPublicId(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String cleanUrl = url.split("[?#]", 2)[0];
        int uploadIdx = cleanUrl.indexOf(UPLOAD_MARKER);
        if (uploadIdx < 0) {
            return null;
        }
        String afterUpload = cleanUrl.substring(uploadIdx + UPLOAD_MARKER.length());
        if (afterUpload.isBlank()) {
            return null;
        }

        Matcher versionMatcher = VERSION_PREFIX_PATTERN.matcher(afterUpload);
        String assetPath = versionMatcher.matches() ? versionMatcher.group(1) : afterUpload;

        int lastSlash = assetPath.lastIndexOf('/');
        int lastDot = assetPath.lastIndexOf('.');
        if (lastDot > lastSlash) {
            assetPath = assetPath.substring(0, lastDot);
        }
        return assetPath.isBlank() ? null : assetPath;
    }
}
