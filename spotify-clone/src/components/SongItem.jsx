import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import { AuthContext } from '../context/AuthContext'
import { assets } from '../assets/assets'
import { useRouter } from 'next/navigation'

const SongItem = ({name,image,desc,id,artistName, song}) => {

    const {playWithId} = useContext(PlayerContext)
    const { user, likedSongs, toggleLike } = useContext(AuthContext);
    const router = useRouter();

    const isLiked = song ? likedSongs.some(s => s._id === (song._id !== undefined ? song._id : song.id)) : false;

  return (
    <div className='min-w-[180px] p-2 px-3 rounded hover:bg-[#ffffff26] transition-transform duration-100 group relative'>
      <div onClick={()=>playWithId(id)} className='cursor-pointer'>
        <img className='rounded' src={image} alt="" />
        <p className='font-bold mt-2 mb-1'>{name}</p>
        <p 
            className='text-slate-200 text-sm font-semibold hover:underline cursor-pointer'
            onClick={(e) => { e.stopPropagation(); router.push(`/artist/${encodeURIComponent(artistName)}`); }}
        >
            {artistName}
        </p>
        <p className='text-slate-200 text-sm truncate'>{desc}</p>
      </div>
      {user && song && (
        <img 
            onClick={(e) => { e.stopPropagation(); toggleLike(song); }} 
            className={`absolute top-4 right-4 w-6 p-1 bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'opacity-100' : ''}`} 
            style={isLiked ? { filter: 'invert(53%) sepia(43%) saturate(5838%) hue-rotate(114deg) brightness(99%) contrast(99%)' } : {}}
            src={assets.like_icon} 
            alt="like" 
        />
      )}
    </div>
  )
}

export default SongItem
