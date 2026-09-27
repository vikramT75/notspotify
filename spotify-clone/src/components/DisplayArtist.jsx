"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams, useRouter } from 'next/navigation'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import { TrackList } from './DisplayLikedSongs'
import axios from 'axios'

const DisplayArtist = () => {
  const { id } = useParams()
  const router = useRouter()
  const artistName = decodeURIComponent(id)
  const [artistSongs, setArtistSongs] = useState([])
  const { url, playWithId } = useContext(PlayerContext)
  const { likedSongs, toggleLike } = useContext(AuthContext)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get(`${url}/api/song/artist/${encodeURIComponent(artistName)}`)
        if (res.data.success) setArtistSongs(res.data.songs)
      } catch {}
    }
    fetchSongs()
  }, [artistName, url])

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className='flex items-end gap-6 mb-8'>
        <div className='w-36 h-36 rounded-full bg-[#1e1e1e] flex items-center justify-center flex-shrink-0 shadow-lg'>
          <svg className='w-14 h-14 text-zinc-500' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/>
          </svg>
        </div>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>Artist</p>
          <h1 className='text-3xl font-bold text-white mb-1'>{artistName}</h1>
          <p className='text-sm text-zinc-500'>{artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </div>

      {artistSongs.length === 0 ? (
        <p className='text-zinc-600 text-sm'>No songs found for this artist.</p>
      ) : (
        <TrackList
          tracks={artistSongs}
          onPlay={playWithId}
          onToggleLike={toggleLike}
          likedSongs={likedSongs}
        />
      )}
    </>
  )
}

export default DisplayArtist
