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
  <div className="max-w-3xl mx-auto">
        <div className="text-2xl font-bold text-gray-800 ">最新新闻</div>
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-md">
            <div className="mb-6">
                <div className="text font-bold text-gray-800 mb-1">“双向国际化”再获关键突破</div>
                <div className="text-sm text-gray-500 mb-2">2024年6月15日</div>
                <div className="text-gray-600">
                    华南理工大学书记章熙春出席中新教育发展论坛，与坎特伯雷大学签署智慧医疗自动化国际合作协议，推动高水平科研与人才合作。
                </div>
            </div>
            <div className="mb-6">
                <div className="text font-bold text-gray-800 mb-1">从 “新”出发　向“质”而行　校领导讲授专题思政课</div>
                <div className="text-sm text-gray-500 mb-2">2024年6月14日</div>
                <div className="text-gray-600">
                    华南理工大学党委副书记徐国正为计算机学院学生讲授思政课，强调创新驱动和高质量发展，鼓励学生勇于探索，实现梦想。
                </div>
            </div>
            <div>
                <div className="text font-bold text-gray-800 mb-1">“精彩一课” 推动党纪学习教育入心入脑　学校举行专题报告会</div>
                <div className="text-sm text-gray-500 mb-2">2024年6月13日</div>
                <div className="text-gray-600">
                    北京师范大学王炳林教授在华南理工大学讲授党纪专题党课，解读习近平关于党的建设思想及《中国共产党纪律处分条例》，促进党员干部深入学习、知纪守纪。
                </div>
            </div>
        </div>
    </div>
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