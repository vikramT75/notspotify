import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

const Player = () => {

    const {track,seekBar,seekBg,playStatus,play,pause,time,previous,next,seekSong,audioRef, url} = useContext(PlayerContext);
    const { user, likedSongs, toggleLike, token } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

    useEffect(() => {
        if (token) {
            axios.get(`${url}/api/playlist/user`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setPlaylists(res.data.playlists || []))
                .catch(err => console.error(err));
        }
    }, [token, url]);

    const addToPlaylist = async (playlistId) => {
        try {
            await axios.post(`${url}/api/playlist/add-song`, { playlistId, songId: track._id || track.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowPlaylistMenu(false);
            alert("Added to playlist");
        } catch (error) {
            console.error(error);
        }
    };

    const isLiked = track ? likedSongs.some(s => s._id === (track._id || track.id)) : false;

  return track ? (
    <div className='h-[10%] bg-black flex justify-between items-center text-white px-4'>
      <div className='hidden lg:flex items-center gap-4 relative'>
        <img className='w-12' src={track.image} alt="" />
        <div>
            <p>{track.name}</p>
            <p className='text-xs text-gray-400'>{track.artistName ? track.artistName.slice(0,12) : ''}</p>
        </div>
        {user && (
            <img 
              onClick={() => toggleLike(track)} 
              className="w-5 cursor-pointer" 
              style={isLiked ? { filter: 'invert(53%) sepia(43%) saturate(5838%) hue-rotate(114deg) brightness(99%) contrast(99%)' } : {}}
              src={assets.like_icon} 
              alt="like" 
            />
        )}
        {user && playlists.length > 0 && (
            <div className='relative'>
                <span onClick={() => setShowPlaylistMenu(!showPlaylistMenu)} className="cursor-pointer text-xl font-bold">+</span>
                {showPlaylistMenu && (
                    <div className='absolute bottom-8 left-0 bg-[#282828] p-2 rounded shadow-lg min-w-[150px] z-50'>
                        <p className='text-xs text-gray-400 mb-2'>Add to playlist:</p>
                        {playlists.map(pl => (
                            <p key={pl._id || pl.id} onClick={() => addToPlaylist(pl._id || pl.id)} className='text-sm py-1 cursor-pointer hover:text-green-500 truncate'>
                                {pl.name}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
      <div className='flex flex-col items-center gap-1 m-auto'>
        <div className='flex gap-4'>
            <img className='w-4 cursor-pointer' src={assets.shuffle_icon} alt="" />
            <img onClick={previous} className='w-4 cursor-pointer' src={assets.prev_icon} alt="" />
            {playStatus
            ?<img onClick={pause} className='w-4 cursor-pointer' src={assets.pause_icon} alt="" />
            :<img onClick={play} className='w-4 cursor-pointer' src={assets.play_icon} alt="" />
            }
            <img onClick={next} className='w-4 cursor-pointer' src={assets.next_icon} alt="" />
            <img className='w-4 cursor-pointer' src={assets.loop_icon} alt="" />
        </div>
        <div className='flex items-center gap-5'>
            <p>{time.currentTime.minute}:{String(time.currentTime.second).padStart(2, '0')}</p>
            <div ref={seekBg} onClick={seekSong} className='w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'>
                <hr ref={seekBar} className='h-1 border-none w-0 bg-green-800 rounded-full'/>
            </div>
            <p>{track.duration}</p>
        </div>
      </div>
      <div className='hidden lg:flex items-center gap-2 opacity-75'>
        <img className='w-4' src={assets.volume_icon} alt="" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          defaultValue="1"
          onChange={(e) => {
            if (audioRef && audioRef.current) {
              audioRef.current.volume = e.target.value;
            }
          }}
          className='w-20 h-1 accent-green-500 cursor-pointer' 
        />
      </div>
    </div>
  )
  : null
}

export default Player
