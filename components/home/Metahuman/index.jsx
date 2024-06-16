import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useAppContext } from '@/components/AppContext';

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const {options, onReady} = props;
  const {state:{user},dispatch} = useAppContext()

  React.useEffect(() => {

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

return (
    <div data-vjs-player className="flex flex-col relative h-full w-[260px] bg-blue-50 text-blue-400 p-2">
      <div ref={videoRef} className="flex-1" />
      <div className="mt-auto p-2">
        {/* <div className="mb-2">
          <a href="https://www.scut.edu.cn/new/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            华南理工大学官网
          </a>
          <br />
          <a href="https://www2.scut.edu.cn/gzic/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            广州国际校区官网
          </a>
          <br/>
          <a href="http://www.lib.scut.edu.cn/main.htm" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            华南理工大学图书馆
          </a>
          <br />
          <a href="https://github.com/ddeellttaa/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            张博文github
          </a>
        </div> */}
        <div className="flex items-center">
          <img src="logo.png" alt="Avatar" className="w-10 h-10 rounded-full mr-2" />
          <div className="wb-10">{user}</div>
        </div>
      </div>
    </div>
  );
}

export default VideoJS;