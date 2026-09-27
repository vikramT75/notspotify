"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'next/navigation'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const DisplayAlbum = () => {
    const {id} = useParams();
    const [albumData,setAlbumData] = useState("")
    const {playWithId,albumsData,songsData} = useContext(PlayerContext);
    const { user, likedSongs, toggleLike } = useContext(AuthContext);
    
    useEffect(()=>{
      albumsData.forEach((item)=>{
        const itemId = item._id !== undefined ? item._id : item.id;
        if (String(itemId) === String(id)) {
          setAlbumData(item);
        }
      })
    },[albumsData, id])

  return albumData ? (
    <>
      <Navbar/>
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <img className='w-48 rounded' src={albumData.image} alt="" />
        <div className='flex flex-col'>
            <p>Playlist</p>
            <h2 className='text-5xl font-bold mb-4 md:text-7xl'>{albumData.name}</h2>
            <h4>{albumData.desc}</h4>
            <p className='mt-1 text-sm text-gray-300'>Collaborators: {albumData.collaborators || "None"}</p>

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
        songsData.filter((item)=>item.album === albumData.name || !item.album).map((item,index)=>{
            const isLiked = likedSongs.some(s => s._id === (item._id !== undefined ? item._id : item.id));
            return (
            <div key={index} className='grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] group'>
                <p className='text-white cursor-pointer' onClick={()=>playWithId(item._id !== undefined ? item._id : item.id)}>
                    <b className='mr-4 text-[#a7a7a7]'>{index+1}</b>
                    <img className='inline w-10 mr-5' src={item.image} alt="" />
                    {item.name}
                </p>
                <p className='text-[15px]'>{albumData.name}</p>
                <p className='text-[15px] hidden sm:block'>{item.releaseDate || "5 days ago"}</p>
                <p className='text-[15px] text-center'>{item.duration}</p>
                <div className='flex justify-center'>
                    {user && (
                        <img 
                            onClick={() => toggleLike(item)} 
                            className={`w-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'opacity-100 filter sepia brightness-200 hue-rotate-90 saturate-200' : ''}`} 
                            src={assets.like_icon} 
                            alt="like" 
                        />
                    )}
                </div>
            </div>
            )
        })
      }
    </>
  ) : null
}

export default DisplayAlbum
