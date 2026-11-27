function encodeBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function createMockJwt(username, role = 'ADMIN', expiresInSeconds = 3600) {
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

export async function installAdminApiMocks(page, options = {}) {
  let songs = [
    {
      _id: 'song-seed-1',
      name: 'Existing Track',
      desc: 'Initial track',
      album: 'Single',
      image: '/admin/favicon.ico',
      file: '/song1.mp3',
      duration: '3:00',
      artistName: 'Seed Artist',
      releaseDate: '2026-01-01',
    },
  ];
  let albums = [
    {
      _id: 'album-seed-1',
      name: 'Seed Album',
      desc: 'Initial album',
      bgColour: '#121212',
      image: '/admin/favicon.ico',
      collaborators: 'None',
      releaseDate: '2026-01-01',
    },
  ];
  let songCounter = 2;
  let albumCounter = 2;
  let forceUnauthorizedNext = Boolean(options.forceUnauthorizedNext);

  const setForceUnauthorizedNext = (val) => {
    forceUnauthorizedNext = val;
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    const json = (status, body) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });

    if (method === 'POST' && pathname === '/api/auth/login') {
      const { username, password } = request.postDataJSON();
      if (username === 'admin1' && password === 'admin1') {
        return json(200, {
          token: createMockJwt('admin1', 'ADMIN'),
          username: 'admin1',
          email: 'admin1@gmail.com',
          role: 'ADMIN',
        });
      }
      if (username === 'listener1' && password === 'Password123') {
        return json(200, {
          token: createMockJwt('listener1', 'USER'),
          username: 'listener1',
          email: 'listener1@example.com',
          role: 'USER',
        });
      }
      return json(401, { message: 'Invalid credentials' });
    }

    if (method === 'GET' && pathname === '/api/song/list') {
      return json(200, { success: true, songs });
    }

    if (method === 'GET' && pathname === '/api/album/list') {
      return json(200, { success: true, albums });
    }

    const authHeader = request.headers()['authorization'] || '';
    if (!authHeader.startsWith('Bearer ') || forceUnauthorizedNext) {
      forceUnauthorizedNext = false;
      return json(401, { message: 'Unauthorized' });
    }

    let role = '';
    try {
      const payload = JSON.parse(Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString('utf8'));
      role = payload.role || '';
    } catch {
      return json(401, { message: 'Invalid token' });
    }

    if (role !== 'ROLE_ADMIN') {
      return json(403, { message: 'Forbidden' });
    }

    if (method === 'POST' && pathname === '/api/song/add') {
      const id = `song-${songCounter++}`;
      songs = [
        ...songs,
        {
          _id: id,
          name: 'Uploaded Admin Track',
          desc: 'Uploaded from Playwright',
          album: 'Single',
          image: '/admin/favicon.ico',
          file: '/song1.mp3',
          duration: '2:30',
          artistName: 'Admin Artist',
          releaseDate: '2026-03-01',
        },
      ];
      return json(200, { success: true, message: 'Song Added' });
    }

    if (method === 'POST' && pathname === '/api/song/remove') {
      const { id } = request.postDataJSON();
      songs = songs.filter((s) => s._id !== id);
      return json(200, { success: true, message: 'Song Remove' });
    }

    if (method === 'POST' && pathname === '/api/album/add') {
      const id = `album-${albumCounter++}`;
      albums = [
        ...albums,
        {
          _id: id,
          name: 'Uploaded Album',
          desc: 'Uploaded album desc',
          bgColour: '#121212',
          image: '/admin/favicon.ico',
          collaborators: 'None',
          releaseDate: '2026-03-01',
        },
      ];
      return json(200, { success: true, message: 'Album Added' });
    }

    if (method === 'POST' && pathname === '/api/album/remove') {
      const { id } = request.postDataJSON();
      albums = albums.filter((a) => a._id !== id);
      songs = songs.filter((s) => s.album !== id);
      return json(200, { success: true, message: 'Album and its songs removed' });
    }

    return json(404, { message: `Unhandled route: ${method} ${pathname}` });
  });

  return { setForceUnauthorizedNext };
}
