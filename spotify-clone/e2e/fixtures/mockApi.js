function encodeBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function createMockJwt(username, role = 'USER', expiresInSeconds = 3600) {
  const header = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = encodeBase64Url({
    sub: username,
    username,
    role: `ROLE_${role}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
  return `${header}.${payload}.mock-signature`;
}

export async function installCloneApiMocks(page) {
  const albums = [
    {
      _id: 'album-1',
      name: 'Night Drive',
      desc: 'Late night synthwave collection',
      bgColour: '#1e3a8a',
      image: '/next.svg',
      collaborators: 'None',
      releaseDate: '2026-01-15',
    },
    {
      _id: 'album-2',
      name: 'Acoustic Echoes',
      desc: 'Unplugged sessions',
      bgColour: '#14532d',
      image: '/globe.svg',
      collaborators: 'Solar Echo',
      releaseDate: '2026-02-10',
    },
  ];

  const songs = [
    {
      _id: 'song-1',
      name: 'Midnight Signal',
      desc: 'Opening synth track',
      album: 'album-1',
      image: '/next.svg',
      file: '/song1.mp3',
      duration: '3:12',
      artistName: 'Neon Pulse',
      releaseDate: '2026-01-15',
    },
    {
      _id: 'song-2',
      name: 'Neon Horizon',
      desc: 'Driving bassline',
      album: 'Night Drive',
      image: '/globe.svg',
      file: '/song2.mp3',
      duration: '2:54',
      artistName: 'Solar Echo',
      releaseDate: '2026-01-20',
    },
    {
      _id: 'song-3',
      name: 'Starlight Drift',
      desc: 'Ambient single',
      album: 'Single',
      image: '/window.svg',
      file: '/song3.mp3',
      duration: '3:30',
      artistName: 'Neon Pulse',
      releaseDate: '2026-02-01',
    },
  ];

  const users = new Map([
    [
      'listener1',
      {
        username: 'listener1',
        email: 'listener1@example.com',
        password: 'Password123',
        role: 'USER',
      },
    ],
  ]);

  let likedSongs = [];
  let playlists = [];
  let playlistCounter = 1;

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname, searchParams } = url;
    const method = request.method();

    const json = (status, body) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });

    if (method === 'GET' && pathname === '/api/song/list') {
      return json(200, { success: true, songs });
    }

    if (method === 'GET' && pathname === '/api/album/list') {
      return json(200, { success: true, albums });
    }

    if (method === 'GET' && pathname.startsWith('/api/song/artist/')) {
      const artistName = decodeURIComponent(pathname.replace('/api/song/artist/', '')).toLowerCase();
      const matching = songs.filter((s) => s.artistName.toLowerCase() === artistName);
      return json(200, { success: true, songs: matching });
    }

    if (method === 'GET' && pathname === '/api/search') {
      const q = (searchParams.get('query') || '').toLowerCase();
      const matchingSongs = songs.filter(
        (s) => s.name.toLowerCase().includes(q) || s.artistName.toLowerCase().includes(q)
      );
      const matchingAlbums = albums.filter((a) => a.name.toLowerCase().includes(q));
      return json(200, { success: true, songs: matchingSongs, albums: matchingAlbums });
    }

    if (method === 'POST' && pathname === '/api/auth/signup') {
      const body = request.postDataJSON();
      if ([...users.values()].some((u) => u.email === body.email)) {
        return route.fulfill({ status: 400, body: 'Error: Email is already in use!' });
      }
      if (users.has(body.username)) {
        return route.fulfill({ status: 400, body: 'Error: Username is already taken!' });
      }
      users.set(body.username, {
        username: body.username,
        email: body.email,
        password: body.password,
        role: 'USER',
      });
      return route.fulfill({ status: 200, body: 'User registered successfully!' });
    }

    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = request.postDataJSON();
      const user = users.get(body.username);
      if (!user || user.password !== body.password) {
        return json(401, { message: 'Invalid credentials' });
      }
      return json(200, {
        token: createMockJwt(user.username, user.role),
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }

    const authHeader = request.headers()['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json(401, { message: 'Unauthorized' });
    }
    const token = authHeader.slice(7);
    let currentUsername = 'listener1';
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      currentUsername = payload.username || payload.sub;
    } catch {
      return json(401, { message: 'Unauthorized' });
    }

    if (method === 'GET' && pathname === '/api/user/liked-songs') {
      return json(200, { success: true, likedSongs });
    }

    if (method === 'POST' && pathname === '/api/user/like-song') {
      const { songId } = request.postDataJSON();
      const song = songs.find((s) => s._id === songId);
      if (!song) return json(400, { message: 'Song not found' });
      if (!likedSongs.some((s) => s._id === songId)) {
        likedSongs = [...likedSongs, song];
      }
      return json(200, { success: true, message: 'Song liked' });
    }

    if (method === 'POST' && pathname === '/api/user/unlike-song') {
      const { songId } = request.postDataJSON();
      likedSongs = likedSongs.filter((s) => s._id !== songId);
      return json(200, { success: true, message: 'Song unliked' });
    }

    if (method === 'GET' && pathname === '/api/playlist/user') {
      return json(200, { success: true, playlists });
    }

    if (method === 'POST' && pathname === '/api/playlist/create') {
      const { name, desc } = request.postDataJSON();
      const playlist = {
        _id: `playlist-${playlistCounter++}`,
        name,
        desc: desc || '',
        description: desc || '',
        image: '',
        user: { username: currentUsername },
        songs: [],
      };
      playlists = [...playlists, playlist];
      return json(200, { success: true, playlist });
    }

    if (method === 'GET' && pathname.startsWith('/api/playlist/')) {
      const id = pathname.replace('/api/playlist/', '');
      const playlist = playlists.find((p) => p._id === id);
      if (!playlist) return json(404, { message: 'Not found' });
      return json(200, { success: true, playlist });
    }

    if (method === 'POST' && pathname === '/api/playlist/add-song') {
      const { playlistId, songId } = request.postDataJSON();
      const playlist = playlists.find((p) => p._id === playlistId);
      const song = songs.find((s) => s._id === songId);
      if (!playlist || !song) return json(400, { message: 'Not found' });
      if (!playlist.songs.some((s) => s._id === songId)) {
        playlist.songs = [...playlist.songs, song];
      }
      return json(200, { success: true, message: 'Song added to playlist' });
    }

    if (method === 'POST' && pathname === '/api/playlist/remove-song') {
      const { playlistId, songId } = request.postDataJSON();
      const playlist = playlists.find((p) => p._id === playlistId);
      if (!playlist) return json(400, { message: 'Not found' });
      playlist.songs = playlist.songs.filter((s) => s._id !== songId);
      return json(200, { success: true, message: 'Song removed from playlist' });
    }

    return json(404, { message: `Unhandled route: ${method} ${pathname}` });
  });
}
