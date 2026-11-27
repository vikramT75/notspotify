package com.spotify.backend.security;

import com.spotify.backend.entity.Role;
import com.spotify.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private final JwtUtils jwtUtils = new JwtUtils();

    @Test
    void generateAndValidateTokenRoundTripsUsername() {
        User user = new User("listener1", "listener1@example.com", "encoded", Role.USER);
        UserDetailsImpl principal = UserDetailsImpl.build(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String token = jwtUtils.generateJwtToken(auth);

        assertNotNull(token);
        assertEquals(3, token.split("\\.").length);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("listener1", jwtUtils.getUsernameFromJwtToken(token));
    }

    @Test
    void validateJwtTokenRejectsEmptyMalformedAndTamperedTokens() {
        User user = new User("admin1", "admin1@example.com", "encoded", Role.ADMIN);
        UserDetailsImpl principal = UserDetailsImpl.build(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String validToken = jwtUtils.generateJwtToken(auth);

        String tampered = validToken.substring(0, validToken.length() - 2) + "xx";

        assertFalse(jwtUtils.validateJwtToken(""));
        assertFalse(jwtUtils.validateJwtToken("not-a-jwt"));
        assertFalse(jwtUtils.validateJwtToken(tampered));
    }
}
