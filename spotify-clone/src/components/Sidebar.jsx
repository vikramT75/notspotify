"use client";
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthContext } from '../context/AuthContext'
import { PlayerContext } from '../context/PlayerContext'
import axios from 'axios'

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname() || '/'
  const { user, token } = React.useContext(AuthContext)
  const { url } = React.useContext(PlayerContext)
  const [playlists, setPlaylists] = React.useState([])

  React.useEffect(() => {
    if (token) {
      axios
        .get(`${url}/api/playlist/user`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setPlaylists(res.data.playlists || []))
        .catch(() => {})
    }
  }, [token, url])

  const handleCreatePlaylist = async () => {
    if (!token) return alert('Please login first')
    const name = prompt('Playlist name:')
    if (!name) return
    try {
      const res = await axios.post(
        `${url}/api/playlist/create`,
        { name, desc: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) setPlaylists(prev => [...prev, res.data.playlist])
    } catch {}
  }

  const isActive = (path) => pathname === path

  const NavLink = ({ path, label, icon }) => (
    <button
      onClick={() => router.push(path)}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left
        ${isActive(path)
          ? 'text-white bg-[#1a1a1a]'
          : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
        }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className='w-64 h-full flex-col gap-4 text-white hidden lg:flex flex-shrink-0'>
      {/* Brand */}
      <div className='px-4 pt-4 pb-2'>
        <span className='text-xl font-bold tracking-tight text-white'>NotSpotify</span>
      </div>

      {/* Nav */}
      <nav className='px-2'>
        <NavLink
          path='/'
          label='Home'
          icon={
            <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/>
            </svg>
          }
        />
        <NavLink
          path='/search'
          label='Search'
          icon={
            <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.28-7.407 7.28-7.407-3.274-7.407-7.28z'/>
            </svg>
          }
        />
      </nav>

      {/* Divider */}
      <div className='mx-4 border-t border-[#1f1f1f]' />

      {/* Library */}
      <div className='flex-1 overflow-hidden flex flex-col px-2'>
        <div className='flex items-center justify-between px-3 mb-2'>
          <span className='text-xs font-semibold text-zinc-500 uppercase tracking-wider'>Library</span>
          {user && (
            <button
              onClick={handleCreatePlaylist}
              className='text-zinc-500 hover:text-white transition-colors'
              title='New playlist'
            >
              <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/>
              </svg>
            </button>
          )}
        </div>

        <div className='overflow-y-auto flex-1 pb-4 space-y-0.5'>
          {/* Liked Songs — always shown if logged in */}
          {user && (
            <button
              onClick={() => router.push('/liked-songs')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded text-sm transition-colors text-left
                ${pathname === '/liked-songs'
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
            >
              <div className='w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-blue-300 flex items-center justify-center flex-shrink-0'>
                <svg className='w-4 h-4 text-white' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z'/>
                </svg>
              </div>
              <div className='min-w-0'>
                <p className='font-medium text-white text-sm truncate'>Liked Songs</p>
                <p className='text-xs text-zinc-500'>Playlist</p>
              </div>
            </button>
          )}

          {/* User playlists */}
          {playlists.map((pl) => (
            <button
              key={pl._id || pl.id}
              onClick={() => router.push(`/playlist/${pl._id || pl.id}`)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded text-sm transition-colors text-left
                ${pathname === `/playlist/${pl._id || pl.id}`
                  ? 'text-white bg-[#1a1a1a]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
            >
              <div className='w-8 h-8 rounded bg-[#282828] flex items-center justify-center flex-shrink-0'>
                <svg className='w-3.5 h-3.5 text-zinc-400' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3z'/>
                </svg>
              </div>
              <div className='min-w-0'>
                <p className='font-medium text-sm truncate'>{pl.name}</p>
                <p className='text-xs text-zinc-500 truncate'>Playlist · {user?.username}</p>
              </div>
            </button>
          ))}

          {/* Empty state */}
          {!user && (
            <p className='text-xs text-zinc-600 px-3 py-4 leading-relaxed'>
              Log in to create playlists and save your favourite songs.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
