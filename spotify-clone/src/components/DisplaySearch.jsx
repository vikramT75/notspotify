"use client";
import React, { useState, useContext } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import SongItem from './SongItem';
import AlbumItem from './AlbumItem';

const DisplaySearch = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const { url } = useContext(PlayerContext) || { url: process.env.NEXT_PUBLIC_API_URL || '' };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      setLoading(true);
      try {
        const res = await axios.get(`${url}/api/search?query=${encodeURIComponent(val)}`);
        if (res.data.success) {
          setSongs(res.data.songs);
          setAlbums(res.data.albums);
        }
      } catch {
        setSongs([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSongs([]);
      setAlbums([]);
    }
  };

  return (
    <>
      <Navbar />

      {/* Search input */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 max-w-md focus-within:border-zinc-500 transition-colors'>
          <svg className='w-5 h-5 text-zinc-500 flex-shrink-0' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.28-7.407 7.28-7.407-3.274-7.407-7.28z'/>
          </svg>
          <input
            type='text'
            value={query}
            onChange={handleSearch}
            placeholder='Search songs, artists, albums…'
            className='bg-transparent outline-none text-white text-sm w-full placeholder-zinc-600'
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSongs([]); setAlbums([]); }}
              className='text-zinc-500 hover:text-white transition-colors flex-shrink-0'
            >
              <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className='text-zinc-600 text-sm'>Searching…</p>
      )}

      {!loading && query && (
        <>
          {songs.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-white font-bold text-lg mb-4'>Songs</h2>
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {songs.map((item, i) => (
                  <SongItem
                    key={i}
                    name={item.name}
                    desc={item.desc}
                    id={item._id || item.id}
                    image={item.image}
                    artistName={item.artistName}
                    song={item}
                  />
                ))}
              </div>
            </div>
          )}

          {albums.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-white font-bold text-lg mb-4'>Albums</h2>
              <div className='flex gap-4 overflow-x-auto pb-2'>
                {albums.map((item, i) => (
                  <AlbumItem
                    key={i}
                    name={item.name}
                    desc={item.desc}
                    id={item._id || item.id}
                    image={item.image}
                  />
                ))}
              </div>
            </div>
          )}

          {songs.length === 0 && albums.length === 0 && (
            <p className='text-zinc-500 text-sm'>No results for "<span className='text-white'>{query}</span>"</p>
          )}
        </>
      )}
    </>
  );
};

export default DisplaySearch;
