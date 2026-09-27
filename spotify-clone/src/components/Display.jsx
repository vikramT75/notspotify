import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import DisplayLikedSongs from './DisplayLikedSongs'
import DisplayPlaylist from './DisplayPlaylist'
import DisplaySearch from './DisplaySearch'
import DisplayArtist from './DisplayArtist'
import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'
// import { albumsData } from '../assets/assets'

const Display = () => {

  const { albumsData } = useContext(PlayerContext)

  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  const albumId = isAlbum ? location.pathname.split("/").pop() : "";
  const bgColor = isAlbum ? albumsData.find((x) => (x._id == albumId)).bgColour : "#121212";

  useEffect(() => {
    if (isAlbum) {
      displayRef.current.style.background = `linear-gradient(${bgColor},#121212)`
    }
    else {
      displayRef.current.style.background = `#121212`
    }
  })

  return (
    <div ref={displayRef} className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'>
      <Routes>
        <Route path='/' element={<DisplayHome />} />
        <Route path='/album/:id' element={<DisplayAlbum album={albumsData.find((x) => String(x._id || x.id) === String(albumId))}/>} />
        <Route path='/liked-songs' element={<DisplayLikedSongs />} />
        <Route path='/playlist/:id' element={<DisplayPlaylist />} />
        <Route path='/search' element={<DisplaySearch />} />
        <Route path='/artist/:id' element={<DisplayArtist />} />
      </Routes>
    </div>
  )
}

export default Display
