import React, { useContext, useState, useEffect } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

// Inline SVG icons — no dependency on assets
const PlayIcon = () => (
  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>
)
const PauseIcon = () => (
  <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'><path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/></svg>
)
const PrevIcon = () => (
  <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M6 6h2v12H6zm3.5 6 8.5 6V6z'/></svg>
)
const NextIcon = () => (
  <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z'/></svg>
)
const VolumeIcon = () => (
  <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z'/></svg>
)
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

const Player = () => {
  const { track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong, audioRef, url } = useContext(PlayerContext)
  const { user, likedSongs, toggleLike, token } = useContext(AuthContext)
  const [playlists, setPlaylists] = useState([])
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)

  useEffect(() => {
    if (token) {
      axios
        .get(`${url}/api/playlist/user`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setPlaylists(res.data.playlists || []))
        .catch(() => {})
    }
  }, [token, url])

  const addToPlaylist = async (playlistId) => {
    try {
      await axios.post(
        `${url}/api/playlist/add-song`,
        { playlistId, songId: track._id || track.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowPlaylistMenu(false)
    } catch {}
  }

  const isLiked = track ? likedSongs.some(s => s._id === (track._id || track.id)) : false

  if (!track) return null

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className='h-[10%] min-h-[64px] bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between px-4 gap-4 text-white'>

      {/* Left — track info */}
      <div className='hidden lg:flex items-center gap-3 min-w-0 w-64'>
        <img
          className='w-10 h-10 rounded object-cover flex-shrink-0'
          src={track.image}
          alt={track.name}
        />
        <div className='min-w-0'>
          <p className='text-sm font-medium text-white truncate leading-tight'>{track.name}</p>
          <p className='text-xs text-zinc-500 truncate'>{track.artistName}</p>
        </div>
        {/* Like */}
        {user && (
          <button
            onClick={() => toggleLike(track)}
            className={`flex-shrink-0 transition-colors ${isLiked ? 'text-[#1db954]' : 'text-zinc-500 hover:text-white'}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={isLiked} />
          </button>
        )}
        {/* Add to playlist */}
        {user && playlists.length > 0 && (
          <div className='relative flex-shrink-0'>
            <button
              onClick={() => setShowPlaylistMenu(v => !v)}
              className='text-zinc-500 hover:text-white transition-colors text-lg leading-none'
              aria-label='Add to playlist'
              title='Add to playlist'
            >
              <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/>
              </svg>
            </button>
            {showPlaylistMenu && (
              <div className='absolute bottom-8 left-0 bg-[#282828] border border-[#333] p-2 rounded-lg shadow-xl min-w-[160px] z-50'>
                <p className='text-xs text-zinc-500 mb-2 px-1'>Add to playlist</p>
                {playlists.map(pl => (
                  <button
                    key={pl._id || pl.id}
                    onClick={() => addToPlaylist(pl._id || pl.id)}
                    className='w-full text-left text-sm px-2 py-1.5 text-zinc-300 hover:text-white hover:bg-[#383838] rounded transition-colors truncate'
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centre — controls + seek */}
      <div className='flex flex-col items-center gap-1 flex-1 max-w-lg'>
        <div className='flex items-center gap-5'>
          <button onClick={previous} className='text-zinc-400 hover:text-white transition-colors' aria-label='Previous'>
            <PrevIcon />
          </button>
          <button
            onClick={playStatus ? pause : play}
            className='w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform'
            aria-label={playStatus ? 'Pause' : 'Play'}
          >
            {playStatus ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={next} className='text-zinc-400 hover:text-white transition-colors' aria-label='Next'>
            <NextIcon />
          </button>
        </div>
        {/* Seek bar */}
        <div className='flex items-center gap-2 w-full text-xs text-zinc-500'>
          <span className='tabular-nums w-8 text-right'>
            {time.currentTime.minute}:{pad(time.currentTime.second)}
          </span>
          <div
            ref={seekBg}
            onClick={seekSong}
            className='flex-1 h-1 bg-[#3a3a3a] rounded-full cursor-pointer relative group'
          >
            <div
              ref={seekBar}
              className='h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors w-0'
            />
          </div>
          <span className='tabular-nums w-8'>{track.duration}</span>
        </div>
      </div>

      {/* Right — volume */}
      <div className='hidden lg:flex items-center gap-2 w-32 justify-end'>
        <VolumeIcon />
        <input
          type='range'
          min='0'
          max='1'
          step='0.01'
          defaultValue='1'
          style={{ background: 'linear-gradient(to right, white 100%, #3a3a3a 100%)' }}
          onChange={(e) => { 
            if (audioRef?.current) audioRef.current.volume = e.target.value;
            e.target.style.background = `linear-gradient(to right, white ${e.target.value * 100}%, #3a3a3a ${e.target.value * 100}%)`;
          }}
          className='w-20 h-1 cursor-pointer hover:accent-[#1db954]'
        />
      </div>
    </div>
  )
}

export default Player
