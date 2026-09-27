"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'next/navigation'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const DisplayPlaylist = () => {
    const {id} = useParams();
    const [playlistData, setPlaylistData] = useState(null);
    const {playWithId, url} = useContext(PlayerContext);
    const { user, likedSongs, toggleLike, token } = useContext(AuthContext);
    
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await axios.get(`${url}/api/playlist/${id}`);
                if (response.data.success) {
                    setPlaylistData(response.data.playlist);
                }
            } catch (error) {
                console.error("Failed to fetch playlist", error);
            }
        };
        fetchPlaylist();
    }, [id, url]);

    const handleRemoveSong = async (songId, e) => {
        e.stopPropagation();
        if (!token) return;
        try {
            const response = await axios.post(`${url}/api/playlist/remove-song`, { playlistId: id, songId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setPlaylistData({
                    ...playlistData,
                    songs: playlistData.songs.filter(s => s._id !== songId)
                });
            }
        } catch (error) {
            console.error("Failed to remove song", error);
        }
    };

  return playlistData ? (
    <>
      <Navbar/>
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <div className='w-48 h-48 bg-[#282828] flex items-center justify-center rounded shadow-lg'>
            <svg role="img" height="64" width="64" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z"></path></svg>
        </div>
        <div className='flex flex-col'>
            <p>Playlist</p>
            <h2 className='text-5xl font-bold mb-4 md:text-7xl'>{playlistData.name}</h2>
            <h4>{playlistData.description}</h4>
            <p className='mt-1 text-sm text-gray-300'>{playlistData.user.username} • {playlistData.songs.length} songs</p>
        </div>
      </div>
      <div className='grid grid-cols-4 sm:grid-cols-5 mt-10 mb-4 pl-2 text-[#a7a7a7]'>
        <p><b className='mr-4'>#</b>Title</p>
        <p>Album</p>
        <p className='hidden sm:block'>Date Added</p>
        <img className='m-auto w-4' src={assets.clock_icon} alt="" />
        <p className='text-center'>Actions</p>
      </div>
      <hr />
      {
        playlistData.songs.map((item,index)=>{
            const isLiked = likedSongs.some(s => s._id === (item._id !== undefined ? item._id : item.id));
            return (
            <div key={index} className='grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] group'>
                <p className='text-white cursor-pointer' onClick={()=>playWithId(item._id !== undefined ? item._id : item.id)}>
                    <b className='mr-4 text-[#a7a7a7]'>{index+1}</b>
                    <img className='inline w-10 mr-5' src={item.image} alt="" />
                    {item.name}
                </p>
                <p className='text-[15px]'>{item.album || 'Unknown'}</p>
                <p className='text-[15px] hidden sm:block'>{item.releaseDate || "5 days ago"}</p>
                <p className='text-[15px] text-center'>{item.duration}</p>
                <div className='flex justify-center gap-3'>
                    {user && (
                        <img 
                            onClick={(e) => { e.stopPropagation(); toggleLike(item); }} 
                            className={`w-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'opacity-100 filter sepia brightness-200 hue-rotate-90 saturate-200' : ''}`} 
                            src={assets.like_icon} 
                            alt="like" 
                        />
                    )}
                    {user && user.username === playlistData.user.username && (
                        <span onClick={(e) => handleRemoveSong(item._id || item.id, e)} className="cursor-pointer text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:underline">Remove</span>
                    )}
                </div>
            </div>
            )
        })
      }
    </>
  ) : null
}

export default DisplayPlaylist
