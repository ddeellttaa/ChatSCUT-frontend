"use client"

import Navigation from "@/components/home/Navigation"
import Main from "@/components/home/Main"
import { useAppContext } from "@/components/AppContext"
import VideoJS from "@/components/home/Metahuman"
import {useRef,useEffect, useState} from "react"
import LoginOverlay from "@/components/home/Login/login"
export default function Home() {
    // const {state:{themeMode}} = useAppContext()
    const [isLogin,setLogin] = useState(false)
    const themeMode = "light"
    const playerRef = useRef(null);

    const videoJsOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
        src: 'http://10.40.20.37:8080/hls/streammetahuman.m3u8',
        type: 'application/x-mpegURL'
        }]
    };

    const handlePlayerReady = (player) => {
        playerRef.current = player;

        // You can handle player events here, for example:
        player.on('waiting', () => {
        videojs.log('player is waiting');
        });

        player.on('dispose', () => {
        videojs.log('player will dispose');
        });
    };

    const handleLogin = () =>{
        setLogin(true)
    }

    useEffect(() => {
        // This effect will run only once when the component mounts
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
            }
        };
    }, []);

    

    return (
        <div className={`${themeMode} h-full flex`}>
            <Navigation />
            <Main />
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
            {/* {!isLogin && <LoginOverlay onLogin={handleLogin} />} */}
        </div>
    )
}
