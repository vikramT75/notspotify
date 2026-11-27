package com.spotify.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotify.backend.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CloudinaryService cloudinaryService;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        when(cloudinaryService.uploadImage(any())).thenReturn(Map.of(
                "secure_url", "https://res.cloudinary.com/test-cloud/image/upload/v1/cover_sample.jpg"
        ));
        when(cloudinaryService.uploadAudio(any())).thenReturn(Map.of(
                "secure_url", "https://res.cloudinary.com/test-cloud/video/upload/v1/audio_sample.mp3",
                "duration", 185.0
        ));
        adminToken = loginAndGetToken("admin1", "admin1");
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("username", username, "password", password));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    private void signupUser(String username, String email, String password) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "username", username,
                "email", email,
                "password", password
        ));
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    void seededAdminLoginAndBadCredentialsReturnExpectedStatuses() throws Exception {
        String validBody = objectMapper.writeValueAsString(Map.of("username", "admin1", "password", "admin1"));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.token").isNotEmpty());

        String badBody = objectMapper.writeValueAsString(Map.of("username", "admin1", "password", "wrong"));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signupRejectsDuplicateUsernameAndEmail() throws Exception {
        signupUser("dup_user", "dup_user@example.com", "secret123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "dup_user",
                                "email", "other@example.com",
                                "password", "secret123"))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "other_user",
                                "email", "dup_user@example.com",
                                "password", "secret123"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void securityMatrixEnforcesPublicUserAndAdminRbacRules() throws Exception {
        mockMvc.perform(get("/api/song/list")).andExpect(status().isOk());
        mockMvc.perform(get("/api/album/list")).andExpect(status().isOk());
        mockMvc.perform(get("/api/search").param("query", "test")).andExpect(status().isOk());

        mockMvc.perform(get("/api/user/liked-songs")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/playlist/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\",\"desc\":\"\"}"))
                .andExpect(status().isUnauthorized());

        signupUser("rbac_user", "rbac_user@example.com", "secret123");
        String userToken = loginAndGetToken("rbac_user", "secret123");

        mockMvc.perform(post("/api/song/remove")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/album/remove")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"123\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/song/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"missing-id\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void authenticatedErrorsReturnRealStatusInsteadOfMaskedForbidden() throws Exception {
        mockMvc.perform(post("/api/song/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void playlistOwnershipAndLikedSongsFlowsWorkEndToEnd() throws Exception {
        MockMultipartFile image = new MockMultipartFile("image", "cover.jpg", "image/jpeg", "img".getBytes());
        MockMultipartFile audio = new MockMultipartFile("audio", "song.mp3", "audio/mpeg", "mp3".getBytes());

        mockMvc.perform(multipart("/api/song/add")
                        .file(image)
                        .file(audio)
                        .param("name", "Integration Song")
                        .param("desc", "Track desc")
                        .param("album", "Single")
                        .param("artistName", "Test Artist")
                        .param("releaseDate", "2026-01-01")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        MvcResult listSongsRes = mockMvc.perform(get("/api/song/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.songs", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();
        JsonNode songs = objectMapper.readTree(listSongsRes.getResponse().getContentAsString()).get("songs");
        String songId = null;
        for (JsonNode s : songs) {
            if ("Integration Song".equals(s.get("name").asText())) {
                songId = s.get("_id").asText();
                break;
            }
        }
        assert songId != null;

        signupUser("owner_user", "owner@example.com", "secret123");
        signupUser("other_user2", "other2@example.com", "secret123");
        String ownerToken = loginAndGetToken("owner_user", "secret123");
        String otherToken = loginAndGetToken("other_user2", "secret123");

        // Like and verify liked songs
        mockMvc.perform(post("/api/user/like-song")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("songId", songId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/user/liked-songs")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likedSongs[*]._id", hasItem(songId)));

        // Create playlist
        MvcResult createPlRes = mockMvc.perform(post("/api/playlist/create")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Gym Mix", "desc", "Pump"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();
        String playlistId = objectMapper.readTree(createPlRes.getResponse().getContentAsString())
                .get("playlist").get("_id").asText();

        // Add song as owner
        mockMvc.perform(post("/api/playlist/add-song")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("playlistId", playlistId, "songId", songId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Fetch playlist
        mockMvc.perform(get("/api/playlist/" + playlistId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.playlist.songs[*]._id", hasItem(songId)));

        // Non-owner cannot modify playlist
        mockMvc.perform(post("/api/playlist/add-song")
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("playlistId", playlistId, "songId", songId))))
                .andExpect(status().isForbidden());

        // Remove song from playlist and unlike
        mockMvc.perform(post("/api/playlist/remove-song")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("playlistId", playlistId, "songId", songId))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/user/unlike-song")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("songId", songId))))
                .andExpect(status().isOk());

        // Cleanup song as admin
        mockMvc.perform(post("/api/song/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("id", songId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void removingAlbumCascadesSongsAndDeletesCloudinaryAssets() throws Exception {
        MockMultipartFile albumImg = new MockMultipartFile("image", "album.jpg", "image/jpeg", "img".getBytes());
        mockMvc.perform(multipart("/api/album/add")
                        .file(albumImg)
                        .param("name", "Cascade Album")
                        .param("desc", "Album desc")
                        .param("bgColour", "#121212")
                        .param("collaborators", "None")
                        .param("releaseDate", "2026-01-01")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        MvcResult albumsRes = mockMvc.perform(get("/api/album/list")).andReturn();
        JsonNode albums = objectMapper.readTree(albumsRes.getResponse().getContentAsString()).get("albums");
        String albumId = null;
        for (JsonNode a : albums) {
            if ("Cascade Album".equals(a.get("name").asText())) {
                albumId = a.get("_id").asText();
                break;
            }
        }
        assert albumId != null;

        MockMultipartFile songImg = new MockMultipartFile("image", "song.jpg", "image/jpeg", "img".getBytes());
        MockMultipartFile songAudio = new MockMultipartFile("audio", "song.mp3", "audio/mpeg", "mp3".getBytes());
        mockMvc.perform(multipart("/api/song/add")
                        .file(songImg)
                        .file(songAudio)
                        .param("name", "Cascade Song")
                        .param("desc", "Song desc")
                        .param("album", albumId)
                        .param("artistName", "Cascade Artist")
                        .param("releaseDate", "2026-01-01")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/api/album/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("id", albumId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(cloudinaryService).deleteSongAssets(
                "https://res.cloudinary.com/test-cloud/video/upload/v1/audio_sample.mp3",
                "https://res.cloudinary.com/test-cloud/image/upload/v1/cover_sample.jpg");
        verify(cloudinaryService).deleteByUrl(
                "https://res.cloudinary.com/test-cloud/image/upload/v1/cover_sample.jpg",
                "image");

        mockMvc.perform(get("/api/album/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.albums[?(@.name=='Cascade Album')]").isEmpty());
        mockMvc.perform(get("/api/song/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.songs[?(@.name=='Cascade Song')]").isEmpty());
    }
}
