"use client";
import React from 'react'
import {assets} from '../assets/assets'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import { PlayerContext } from '../context/PlayerContext'

const Sidebar = () => {

    const router = useRouter();
    const { user, token } = React.useContext(AuthContext);
    const { url } = React.useContext(PlayerContext);
    const [playlists, setPlaylists] = React.useState([]);

    React.useEffect(() => {
        if (token) {
            axios.get(`${url}/api/playlist/user`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setPlaylists(res.data.playlists || []))
                .catch(err => console.error(err));
        }
    }, [token, url]);

    const handleCreatePlaylist = async () => {
        if (!token) return alert("Please login first");
        const name = prompt("Enter playlist name:");
        if (!name) return;
        
        try {
            const response = await axios.post(`${url}/api/playlist/create`, { name, desc: "My new playlist" }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setPlaylists([...playlists, response.data.playlist]);
            }
        } catch (error) {
            console.error(error);
        }
    };

  return (
    <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
      <div className='bg-[#121212] h-[15%] rounded flex flex-col justify-around'>
        <div onClick={()=>router.push('/')} className='flex items-center gap-3 pl-8 cursor-pointer'>
            <img className='w-6' src={assets.home_icon} alt="" />
            <p className='font-bold'>Home</p>
        </div>
        <div onClick={()=>router.push('/search')} className='flex items-center gap-3 pl-8 cursor-pointer'>
            <img className='w-6' src={assets.search_icon} alt="" />
            <p className='font-bold'>Search</p>
        </div>
      </div>
      <div className='bg-[#121212] h-[85%] rounded'>
        <div className='p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <img className='w-8' src={assets.stack_icon} alt="" />
                <p className='font-semibold'>Your Library</p>
            </div>
            <div className='flex items-center gap-3'>
                <img onClick={handleCreatePlaylist} className='w-5 cursor-pointer' src={assets.plus_icon} alt="Create Playlist" />
            </div>
        </div>
        <div className='p-2 flex flex-col gap-2 overflow-y-auto h-full pb-20'>
            <div onClick={() => router.push('/liked-songs')} className='flex items-center gap-4 p-2 hover:bg-[#242424] rounded cursor-pointer'>
                <div className='w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-300 flex items-center justify-center rounded'>
                    <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="white"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.117 1.763s.278-.588 1.117-1.763a4.21 4.21 0 0 1 3.675-1.941z"></path></svg>
                </div>
                <div>
                    <p className='font-semibold'>Liked Songs</p>
                    <p className='text-sm text-zinc-400'>Playlist</p>
                </div>
            </div>
            
            {playlists.map((pl, idx) => (
                <div key={idx} onClick={() => router.push(`/playlist/${pl._id || pl.id}`)} className='flex items-center gap-4 p-2 hover:bg-[#242424] rounded cursor-pointer'>
                    <div className='w-12 h-12 bg-[#282828] flex items-center justify-center rounded'>
                        <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z"></path></svg>
                    </div>
                    <div>
                        <p className='font-semibold'>{pl.name}</p>
                        <p className='text-sm text-zinc-400'>Playlist • {user?.username}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
