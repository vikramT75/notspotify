// Static fallback data used only for local development reference.
// The application fetches real data from the backend API.
// Icons have been replaced with inline SVGs throughout the app.

import img1 from './img1.jpg'
import img2 from './img2.jpg'
import img3 from './img3.jpg'
import img4 from './img4.jpg'
import img5 from './img5.jpg'
import img6 from './img6.jpg'
import img7 from './img7.jpg'
import img8 from './img8.jpg'
import img9 from './img9.jpg'
import img10 from './img10.jpg'
import img11 from './img11.jpg'
import img12 from './img12.jpg'
import img13 from './img13.jpg'
import img14 from './img14.jpg'
import img15 from './img15.jpg'
import img16 from './img16.jpg'

const song1 = '/song1.mp3'
const song2 = '/song2.mp3'
const song3 = '/song3.mp3'

// Kept for compatibility — not actively rendered unless API is unreachable
export const albumsData = [
  { id: 0, name: 'Top 50 Global',   image: img8.src,  desc: 'Your weekly update of the most played tracks', bgColor: '#2a4365' },
  { id: 1, name: 'Top 50 India',    image: img9.src,  desc: 'Your weekly update of the most played tracks', bgColor: '#22543d' },
  { id: 2, name: 'Trending India',  image: img10.src, desc: 'Your weekly update of the most played tracks', bgColor: '#742a2a' },
  { id: 3, name: 'Trending Global', image: img16.src, desc: 'Your weekly update of the most played tracks', bgColor: '#44337a' },
  { id: 4, name: 'Mega Hits',       image: img11.src, desc: 'Your weekly update of the most played tracks', bgColor: '#234e52' },
  { id: 5, name: 'Happy Favorites', image: img15.src, desc: 'Your weekly update of the most played tracks', bgColor: '#744210' },
]

export const songsData = [
  { id: 0, name: 'Song One',   image: img1.src,  file: song1, desc: 'Put a smile on your face', duration: '3:00' },
  { id: 1, name: 'Song Two',   image: img2.src,  file: song2, desc: 'Put a smile on your face', duration: '2:20' },
  { id: 2, name: 'Song Three', image: img3.src,  file: song3, desc: 'Put a smile on your face', duration: '2:32' },
  { id: 3, name: 'Song Four',  image: img4.src,  file: song1, desc: 'Put a smile on your face', duration: '2:50' },
  { id: 4, name: 'Song Five',  image: img5.src,  file: song2, desc: 'Put a smile on your face', duration: '3:10' },
  { id: 5, name: 'Song Six',   image: img14.src, file: song3, desc: 'Put a smile on your face', duration: '2:45' },
  { id: 6, name: 'Song Seven', image: img7.src,  file: song1, desc: 'Put a smile on your face', duration: '2:18' },
  { id: 7, name: 'Song Eight', image: img12.src, file: song2, desc: 'Put a smile on your face', duration: '2:35' },
]