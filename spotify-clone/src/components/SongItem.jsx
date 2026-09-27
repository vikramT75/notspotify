import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

// Heart icon inline SVG — no dependency on assets.like_icon
const HeartIcon = ({ filled, className }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill={filled ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth={filled ? 0 : 1.5}
  >
    <path d='M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z'/>
  </svg>
)

const SongItem = ({ name, image, desc, id, artistName, song }) => {
  const { playWithId } = useContext(PlayerContext)
  const { user, likedSongs, toggleLike } = useContext(AuthContext)
  const router = useRouter()

  const isLiked = song
    ? likedSongs.some(s => s._id === (song._id !== undefined ? song._id : song.id))
    : false

  return (
    <div className='group flex flex-col gap-2 p-3 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] transition-colors cursor-pointer min-w-[160px] max-w-[160px] relative'>
      {/* Album art */}
      <div className='relative' onClick={() => playWithId(id)}>
        <img
          className='w-full aspect-square object-cover rounded'
          src={image}
          alt={name}
        />
        {/* Play overlay */}
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center'>
          <div className='w-9 h-9 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg'>
            <svg className='w-4 h-4 text-black ml-0.5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M8 5v14l11-7z'/>
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div onClick={() => playWithId(id)}>
        <p className='text-white text-sm font-semibold truncate leading-tight'>{name}</p>
        <p
          className='text-zinc-500 text-xs truncate mt-0.5 hover:text-white hover:underline transition-colors'
          onClick={(e) => { e.stopPropagation(); if (artistName) router.push(`/artist/${encodeURIComponent(artistName)}`); }}
        >
          {artistName || desc}
        </p>
      </div>

      {/* Like button */}
      {user && song && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
          className={`absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-sm transition-all
            ${isLiked
              ? 'opacity-100 text-[#1db954]'
              : 'opacity-0 group-hover:opacity-100 text-white'
            }`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <HeartIcon filled={isLiked} className='w-3.5 h-3.5' />
        </button>
      )}
    </div>
  )
}

export default SongItem
