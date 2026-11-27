import React from 'react'
import Navbar from './Navbar'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const DisplayHome = () => {
  const { songsData, albumsData, loading } = useContext(PlayerContext)
  const [recentSongs, setRecentSongs] = React.useState([])

  React.useEffect(() => {
    if (loading) return
    try {
      const saved = JSON.parse(localStorage.getItem('recentSongs') || '[]')
      const liveById = new Map(
        songsData.map(s => [String(s._id !== undefined ? s._id : s.id), s])
      )
      const validRecent = Array.isArray(saved)
        ? saved
            .map(item => liveById.get(String(item._id !== undefined ? item._id : item.id)))
            .filter(Boolean)
        : []
      setRecentSongs(validRecent)
      localStorage.setItem('recentSongs', JSON.stringify(validRecent))
    } catch {
      localStorage.removeItem('recentSongs')
      setRecentSongs([])
    }
  }, [loading, songsData])

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

      {/* Loading / Empty state */}
      {loading && songsData.length === 0 && albumsData.length === 0 && (
        <div className='flex items-center justify-center h-40 text-zinc-600 text-sm'>
          Loading music…
        </div>
      )}
      {!loading && songsData.length === 0 && albumsData.length === 0 && (
        <div className='flex items-center justify-center h-40 text-zinc-500 text-sm'>
          No music available yet. Add songs or albums from the admin panel.
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
