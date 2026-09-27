"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'next/navigation'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import { TrackList } from './DisplayLikedSongs'
import axios from 'axios'

const DisplayPlaylist = () => {
  const { id } = useParams()
  const [playlistData, setPlaylistData] = useState(null)
  const { playWithId, url } = useContext(PlayerContext)
  const { user, likedSongs, toggleLike, token } = useContext(AuthContext)

  useEffect(() => {
    if (!token) return
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(`${url}/api/playlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) setPlaylistData(res.data.playlist)
      } catch {}
    }
    fetchPlaylist()
  }, [id, url, token])

  const handleRemoveSong = async (songId, e) => {
    e?.stopPropagation()
    if (!token) return
    try {
      const res = await axios.post(
        `${url}/api/playlist/remove-song`,
        { playlistId: id, songId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setPlaylistData(prev => ({
          ...prev,
          songs: prev.songs.filter(s => (s._id || s.id) !== songId)
        }))
      }
    } catch {}
  }

  if (!playlistData) {
    return (
      <>
        <Navbar />
        <div className='flex items-center justify-center h-40 text-zinc-600 text-sm'>
          {token ? 'Loading playlist…' : 'Log in to view this playlist.'}
        </div>
      </>
    )
  }

  const songs = playlistData.songs ? Array.from(playlistData.songs) : []

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className='flex items-end gap-6 mb-8'>
        <div className='w-36 h-36 rounded-lg bg-[#1e1e1e] flex items-center justify-center flex-shrink-0 shadow-lg'>
          <svg className='w-14 h-14 text-zinc-500' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z'/>
          </svg>
        </div>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>Playlist</p>
          <h1 className='text-3xl font-bold text-white mb-1'>{playlistData.name}</h1>
          {playlistData.description && (
            <p className='text-sm text-zinc-400 mb-1'>{playlistData.description}</p>
          )}
          <p className='text-sm text-zinc-500'>
            {playlistData.user?.username} · {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {songs.length === 0 ? (
        <p className='text-zinc-600 text-sm'>This playlist is empty. Add songs from the player bar.</p>
      ) : (
        <TrackList
          tracks={songs}
          onPlay={playWithId}
          onToggleLike={toggleLike}
          likedSongs={likedSongs}
          onRemove={handleRemoveSong}
          ownerId={playlistData.user?.username}
        />
      )}
    </>
  )
}

export default DisplayPlaylist
