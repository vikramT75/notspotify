"use client";
import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';
import { songsData as defaultSongs, albumsData as defaultAlbums } from "../assets/assets";

export const PlayerContext = createContext();

export const sanitizeUrl = (rawUrl) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("http://localhost:3000") || rawUrl.startsWith("http://localhost:4000")) {
        const path = rawUrl.replace(/^http:\/\/localhost:[0-9]+/, "");
        return path.startsWith("/") ? path : `/${path}`;
    }
    return rawUrl;
};

const PlayerContextProvider = (props) => {
    const audioRef = useRef(null);
    const seekBg = useRef(null);
    const seekBar = useRef(null);
    const url = process.env.NEXT_PUBLIC_API_URL || '';

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    });

    const play = async () => {
        if (audioRef.current && track && track.file) {
            const targetSrc = sanitizeUrl(track.file);
            try {
                if (!audioRef.current.src || !audioRef.current.src.endsWith(targetSrc)) {
                    audioRef.current.src = targetSrc;
                    audioRef.current.load();
                }
                await audioRef.current.play();
                setPlayStatus(true);
            } catch (err) {
                console.error("Play error:", err);
            }
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayStatus(false);
        }
    };

    const playWithId = async (id) => {
        const selectedTrack = songsData.find((item) => {
            const itemId = item._id !== undefined ? item._id : item.id;
            return String(itemId) === String(id);
        });

        if (selectedTrack && audioRef.current) {
            setTrack(selectedTrack);
            const targetSrc = sanitizeUrl(selectedTrack.file);
            if (targetSrc) {
                audioRef.current.src = targetSrc;
                audioRef.current.load();
                try {
                    await audioRef.current.play();
                    setPlayStatus(true);
                } catch (err) {
                    console.error("Playback error:", err);
                }
            }
        }
    };

    const previous = async () => {
        if (!track || songsData.length === 0) return;
        const currentId = track._id !== undefined ? track._id : track.id;
        const currentIndex = songsData.findIndex((item) => {
            const itemId = item._id !== undefined ? item._id : item.id;
            return String(itemId) === String(currentId);
        });

        if (currentIndex > 0) {
            const prevTrack = songsData[currentIndex - 1];
            setTrack(prevTrack);
            const targetSrc = sanitizeUrl(prevTrack.file);
            if (audioRef.current && targetSrc) {
                audioRef.current.src = targetSrc;
                audioRef.current.load();
                try {
                    await audioRef.current.play();
                    setPlayStatus(true);
                } catch (err) {
                    console.error("Previous track error:", err);
                }
            }
        }
    };

    const next = async () => {
        if (!track || songsData.length === 0) return;
        const currentId = track._id !== undefined ? track._id : track.id;
        const currentIndex = songsData.findIndex((item) => {
            const itemId = item._id !== undefined ? item._id : item.id;
            return String(itemId) === String(currentId);
        });

        if (currentIndex >= 0 && currentIndex < songsData.length - 1) {
            const nextTrack = songsData[currentIndex + 1];
            setTrack(nextTrack);
            const targetSrc = sanitizeUrl(nextTrack.file);
            if (audioRef.current && targetSrc) {
                audioRef.current.src = targetSrc;
                audioRef.current.load();
                try {
                    await audioRef.current.play();
                    setPlayStatus(true);
                } catch (err) {
                    console.error("Next track error:", err);
                }
            }
        }
    };

    const seekSong = (e) => {
        if (audioRef.current && audioRef.current.duration && seekBg.current) {
            const progressRatio = e.nativeEvent.offsetX / seekBg.current.offsetWidth;
            audioRef.current.currentTime = progressRatio * audioRef.current.duration;
        }
    };

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            if (response.data && response.data.songs && response.data.songs.length > 0) {
                const cleanedSongs = response.data.songs.map((s) => ({
                    ...s,
                    file: sanitizeUrl(s.file),
                    image: sanitizeUrl(s.image)
                }));
                setSongsData(cleanedSongs);
                setTrack(cleanedSongs[0]);
                if (audioRef.current && cleanedSongs[0].file) {
                    audioRef.current.src = cleanedSongs[0].file;
                    audioRef.current.load();
                }
            } else {
                setSongsData([]);
                setTrack(null);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            setSongsData([]);
            setTrack(null);
        }
    };

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            if (response.data && response.data.albums && response.data.albums.length > 0) {
                const cleanedAlbums = response.data.albums.map((a) => ({
                    ...a,
                    image: sanitizeUrl(a.image)
                }));
                setAlbumData(cleanedAlbums);
            } else {
                setAlbumData([]);
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
            setAlbumData([]);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
                if (seekBar.current) {
                    seekBar.current.style.width = Math.floor((audio.currentTime / audio.duration) * 100) + "%";
                }
                setTime({
                    currentTime: {
                        second: Math.floor(audio.currentTime % 60),
                        minute: Math.floor(audio.currentTime / 60)
                    },
                    totalTime: {
                        second: Math.floor(audio.duration % 60),
                        minute: Math.floor(audio.duration / 60)
                    }
                });
            }
        };

        const handleEnded = () => {
            next();
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [track, songsData]);

    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, []);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        songsData, albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;