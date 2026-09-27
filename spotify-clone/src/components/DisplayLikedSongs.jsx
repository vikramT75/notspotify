"use client";
import React, { useContext } from 'react'
import Navbar from './Navbar'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'

// Shared heart icon
const HeartIcon = ({ filled }) => (
  <svg
    className='w-4 h-4'
    viewBox='0 0 24 24'
    fill={filled ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth={filled ? 0 : 1.5}
  >
    <path d='M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z'/>
  </svg>
)

const DisplayLikedSongs = () => {
  const { playWithId } = useContext(PlayerContext)
  const { user, likedSongs, toggleLike } = useContext(AuthContext)

  if (!user) {
    return (
      <>
        <Navbar />
        <div className='flex flex-col items-center justify-center h-64 text-zinc-500 gap-3'>
          <svg className='w-12 h-12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1}>
            <path d='M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z'/>
          </svg>
          <p className='text-sm'>Log in to see your liked songs</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className='flex items-end gap-6 mb-8'>
        <div className='w-36 h-36 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-300 flex items-center justify-center flex-shrink-0 shadow-lg'>
          <svg className='w-14 h-14 text-white' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z'/>
          </svg>
        </div>
        <div>
          <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>Playlist</p>
          <h1 className='text-3xl font-bold text-white mb-1'>Liked Songs</h1>
          <p className='text-sm text-zinc-400'>{user.username} · {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </div>

      {likedSongs.length === 0 ? (
        <p className='text-zinc-600 text-sm'>No liked songs yet. Like a song to save it here.</p>
      ) : (
        <TrackList tracks={likedSongs} onPlay={playWithId} onToggleLike={toggleLike} showUnlike />
      )}
    </>
  )
}

// Shared track-list table used across Liked Songs, Playlist, Album
export const TrackList = ({ tracks, onPlay, onToggleLike, likedSongs = [], showUnlike = false, onRemove, ownerId }) => {
  const { user } = useContext(AuthContext)
  const resolvedLiked = showUnlike ? tracks : likedSongs  // when showUnlike, every track IS liked

  return (
    <div>
      {/* Column headers */}
      <div className='grid grid-cols-[2rem_1fr_1fr_5rem_2.5rem] gap-3 px-3 py-2 text-xs text-zinc-500 uppercase tracking-wider border-b border-[#1f1f1f] mb-1'>
        <span>#</span>
        <span>Title</span>
        <span>Album</span>
        <span className='text-center'>Duration</span>
        <span />
      </div>

      {tracks.map((item, index) => {
        const itemId = item._id !== undefined ? item._id : item.id
        const isLiked = showUnlike || likedSongs.some(s => s._id === itemId)
        return (
          <div
            key={itemId || index}
            className='grid grid-cols-[2rem_1fr_1fr_5rem_2.5rem] gap-3 px-3 py-2.5 rounded items-center hover:bg-[#1a1a1a] group transition-colors'
          >
            {/* Index */}
            <span className='text-xs text-zinc-500 group-hover:hidden'>{index + 1}</span>
            <button
              onClick={() => onPlay(itemId)}
              className='hidden group-hover:flex items-center justify-center text-white'
              aria-label='Play'
            >
              <svg className='w-3.5 h-3.5' viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>
            </button>

            {/* Title + art */}
            <button
              onClick={() => onPlay(itemId)}
              className='flex items-center gap-3 min-w-0 text-left'
            >
              <img className='w-9 h-9 rounded object-cover flex-shrink-0' src={item.image} alt={item.name} />
              <div className='min-w-0'>
                <p className='text-sm text-white font-medium truncate leading-tight'>{item.name}</p>
                <p className='text-xs text-zinc-500 truncate'>{item.artistName}</p>
              </div>
            </button>

            {/* Album */}
            <span className='text-sm text-zinc-500 truncate'>{item.album || '—'}</span>

            {/* Duration */}
            <span className='text-sm text-zinc-500 text-center tabular-nums'>{item.duration}</span>

            {/* Actions */}
            <div className='flex items-center gap-2 justify-end'>
              {user && onToggleLike && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleLike(item) }}
                  className={`transition-colors ${isLiked ? 'text-[#1db954]' : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                  aria-label={isLiked ? 'Unlike' : 'Like'}
                >
                  <HeartIcon filled={isLiked} />
                </button>
              )}
              {onRemove && user?.username === ownerId && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(itemId, e) }}
                  className='text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all'
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DisplayLikedSongs
