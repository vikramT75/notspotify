"use client";
import React, { useState, useContext } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import SongItem from './SongItem';
import AlbumItem from './AlbumItem';

const DisplaySearch = () => {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const { url } = useContext(PlayerContext) || { url: process.env.NEXT_PUBLIC_API_URL || '' };

    const handleSearch = async (e) => {
        setQuery(e.target.value);
        if (e.target.value.length > 0) {
            try {
                const response = await axios.get(`${url}/api/search?query=${e.target.value}`);
                if (response.data.success) {
                    setSongs(response.data.songs);
                    setAlbums(response.data.albums);
                }
            } catch (error) {
                console.error("Search failed", error);
            }
        } else {
            setSongs([]);
            setAlbums([]);
        }
    };

    return (
        <>
            <Navbar />
            <div className='mt-8 px-4'>
                <div className='flex items-center bg-[#242424] rounded-full px-4 py-2 w-full max-w-md'>
                    <svg role="img" aria-hidden="true" className="w-6 h-6 text-white mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.28-7.407 7.28-7.407-3.274-7.407-7.28z"></path></svg>
                    <input 
                        type="text" 
                        value={query}
                        onChange={handleSearch}
                        placeholder="What do you want to listen to?" 
                        className='bg-transparent outline-none text-white w-full'
                    />
                </div>

                {query.length > 0 && (
                    <div className='mt-8'>
                        {songs.length > 0 && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold mb-4 text-white'>Songs</h2>
                                <div className='flex overflow-auto gap-4'>
                                    {songs.map((item, index) => (
                                        <SongItem key={index} name={item.name} desc={item.desc} id={item._id || item.id} image={item.image} artistName={item.artistName} song={item} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {albums.length > 0 && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-bold mb-4 text-white'>Albums</h2>
                                <div className='flex overflow-auto gap-4'>
                                    {albums.map((item, index) => (
                                        <AlbumItem key={index} name={item.name} desc={item.desc} id={item._id || item.id} image={item.image} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {songs.length === 0 && albums.length === 0 && (
                            <p className='text-gray-400'>No results found for "{query}"</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default DisplaySearch;
