"use client";
import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import { useParams } from 'next/navigation'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import SongItem from './SongItem';

const DisplayArtist = () => {
    const { id } = useParams();
    const artistName = decodeURIComponent(id);
    const [artistSongs, setArtistSongs] = useState([]);
    const { url } = useContext(PlayerContext);
    
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get(`${url}/api/song/artist/${artistName}`);
                if (response.data.success) {
                    setArtistSongs(response.data.songs);
                }
            } catch (error) {
                console.error("Failed to fetch artist songs", error);
            }
        };
        fetchSongs();
    }, [artistName, url]);

  return (
    <>
      <Navbar/>
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <div className='w-48 h-48 bg-gray-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg'>
            <svg role="img" height="64" width="64" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path></svg>
        </div>
        <div className='flex flex-col'>
            <p>Artist</p>
            <h2 className='text-5xl font-bold mb-4 md:text-7xl'>{artistName}</h2>
            <p className='mt-1 text-sm text-gray-300'>{artistSongs.length} songs available</p>
        </div>
      </div>
      
      <div className='mt-12'>
          <h2 className='text-2xl font-bold mb-4 text-white'>Popular Tracks</h2>
          <div className='flex overflow-auto gap-4'>
              {artistSongs.map((item, index) => (
                  <SongItem key={index} name={item.name} desc={item.desc} id={item._id || item.id} image={item.image} artistName={item.artistName} song={item} />
              ))}
          </div>
          {artistSongs.length === 0 && (
              <p className='text-gray-400 mt-4'>No songs found for this artist.</p>
          )}
      </div>
    </>
  )
}

export default DisplayArtist;
