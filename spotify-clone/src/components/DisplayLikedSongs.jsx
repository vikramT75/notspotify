"use client";
import React, { useContext } from 'react'
import Navbar from './Navbar'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const DisplayLikedSongs = () => {
    const {playWithId} = useContext(PlayerContext);
    const { user, likedSongs, toggleLike } = useContext(AuthContext);

  if (!user) {
    return (
        <div className='flex flex-col items-center justify-center h-full text-white'>
            <h2 className='text-3xl font-bold mb-4'>Login to view Liked Songs</h2>
        </div>
    )
  }

  return (
    <>
      <Navbar/>
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <div className='w-48 h-48 bg-gradient-to-br from-indigo-600 to-blue-300 flex items-center justify-center rounded shadow-lg'>
            <svg role="img" height="64" width="64" viewBox="0 0 24 24" fill="white"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z"></path></svg>
        </div>
        <div className='flex flex-col'>
            <p>Playlist</p>
            <h2 className='text-5xl font-bold mb-4 md:text-7xl'>Liked Songs</h2>
            <h4>{likedSongs.length} songs</h4>
            <p className='mt-1 text-sm text-gray-300'>{user.username}</p>
        </div>
      </div>
      <div className='grid grid-cols-4 sm:grid-cols-5 mt-10 mb-4 pl-2 text-[#a7a7a7]'>
        <p><b className='mr-4'>#</b>Title</p>
        <p>Album</p>
        <p className='hidden sm:block'>Date Added</p>
        <img className='m-auto w-4' src={assets.clock_icon} alt="" />
        <p className='text-center'>Like</p>
      </div>
      <hr />
      {
        likedSongs.map((item,index)=>(
            <div key={index} className='grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] group'>
                <p className='text-white cursor-pointer' onClick={()=>playWithId(item._id !== undefined ? item._id : item.id)}>
                    <b className='mr-4 text-[#a7a7a7]'>{index+1}</b>
                    <img className='inline w-10 mr-5' src={item.image} alt="" />
                    {item.name}
                </p>
                <p className='text-[15px]'>{item.album || 'Unknown'}</p>
                <p className='text-[15px] hidden sm:block'>{item.releaseDate || "5 days ago"}</p>
                <p className='text-[15px] text-center'>{item.duration}</p>
                <div className='flex justify-center'>
                    <img 
                        onClick={() => toggleLike(item)} 
                        className={`w-4 cursor-pointer opacity-100 filter sepia brightness-200 hue-rotate-90 saturate-200`} 
                        src={assets.like_icon} 
                        alt="unlike" 
                    />
                </div>
            </div>
        ))
      }
    </>
  )
}

export default DisplayLikedSongs
