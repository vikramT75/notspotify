"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'next/navigation'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import { TrackList } from './DisplayLikedSongs'

const DisplayAlbum = () => {
  const { id } = useParams()
  const { playWithId, albumsData, songsData } = useContext(PlayerContext)
  const { user, likedSongs, toggleLike } = useContext(AuthContext)
  const [albumData, setAlbumData] = useState(null)

  useEffect(() => {
    const found = albumsData.find(item => {
      const itemId = item._id !== undefined ? item._id : item.id
      return String(itemId) === String(id)
    })
    if (found) setAlbumData(found)
  }, [albumsData, id])

  if (!albumData) {
    return (
      <>
        <Navbar />
        <div className='flex items-center justify-center h-40 text-zinc-600 text-sm'>Loading album…</div>
      </>
    )
  }

  const albumTracks = songsData.filter(item => item.album === albumData.name || !item.album)

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className='flex items-end gap-6 mb-8'>
        <img
          className='w-36 h-36 rounded-lg object-cover shadow-lg flex-shrink-0'
          src={albumData.image}
          alt={albumData.name}
        />
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>Album</p>
          <h1 className='text-3xl font-bold text-white mb-1'>{albumData.name}</h1>
          {albumData.desc && <p className='text-sm text-zinc-400 mb-1'>{albumData.desc}</p>}
          {albumData.collaborators && (
            <p className='text-sm text-zinc-500'>
              {albumData.collaborators !== 'None' && albumData.collaborators}
            </p>
          )}
          <p className='text-sm text-zinc-500 mt-1'>{albumTracks.length} {albumTracks.length === 1 ? 'track' : 'tracks'}</p>
        </div>
      </div>

      {albumTracks.length === 0 ? (
        <p className='text-zinc-600 text-sm'>No tracks found for this album.</p>
      ) : (
        <TrackList
          tracks={albumTracks}
          onPlay={playWithId}
          onToggleLike={toggleLike}
          likedSongs={likedSongs}
        />
      )}
    </>
  )
}

export default DisplayAlbum
