import React from 'react'
import Navbar from './Navbar'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const DisplayHome = () => {
  const { songsData, albumsData } = useContext(PlayerContext)
  const [recentSongs, setRecentSongs] = React.useState([])

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSongs')
      if (saved) setRecentSongs(JSON.parse(saved))
    } catch {}
  }, [])

  return (
    <>
      <Navbar />

      {/* Albums / Charts */}
      {albumsData.length > 0 && (
        <Section title='Charts'>
          {albumsData.map((item, i) => (
            <AlbumItem
              key={i}
              name={item.name}
              desc={item.desc}
              id={item._id !== undefined ? item._id : item.id}
              image={item.image}
            />
          ))}
        </Section>
      )}

      {/* Songs */}
      {songsData.length > 0 && (
        <Section title="Today's Hits">
          {songsData.map((item, i) => (
            <SongItem
              key={i}
              name={item.name}
              desc={item.desc}
              id={item._id !== undefined ? item._id : item.id}
              image={item.image}
              artistName={item.artistName}
              song={item}
            />
          ))}
        </Section>
      )}

      {/* Recently played */}
      {recentSongs.length > 0 && (
        <Section title='Recently Played'>
          {recentSongs.map((item, i) => (
            <SongItem
              key={i}
              name={item.name}
              desc={item.desc}
              id={item._id !== undefined ? item._id : item.id}
              image={item.image}
              artistName={item.artistName}
              song={item}
            />
          ))}
        </Section>
      )}

      {/* Empty state */}
      {songsData.length === 0 && albumsData.length === 0 && (
        <div className='flex items-center justify-center h-40 text-zinc-600 text-sm'>
          Loading music…
        </div>
      )}
    </>
  )
}

// Simple section wrapper
const Section = ({ title, children }) => (
  <div className='mb-8'>
    <h2 className='text-white font-bold text-lg mb-4'>{title}</h2>
    <div className='flex gap-4 overflow-x-auto pb-2'>
      {children}
    </div>
  </div>
)

export default DisplayHome
