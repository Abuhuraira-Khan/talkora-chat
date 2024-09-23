import  { useState, useEffect,useRef } from 'react';
import { useSearchParams,useNavigate,useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { formatDistanceToNow, subHours } from 'date-fns';
import { apiUrl } from '../context/Context';

// icon
import { RxCross1 } from "react-icons/rx";
import { IoVolumeMuteOutline } from "react-icons/io5";
import { IoVolumeHighOutline } from "react-icons/io5";
import { CiMenuKebab } from "react-icons/ci";
import { IoMdLink } from "react-icons/io";



const StoryView = () => {

  const [searchParams] = useSearchParams();
  const index = searchParams.get('index') || '0';  
  const {username:storyUsername,id:storyId} = useParams();
  const navigate = useNavigate();

  const [currentStory, setCurrentStory] = useState(parseInt(index));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stories, setStories] = useState<any>({});
  const [user, setUser] = useState<any>({});
  const [moreStories, setMoreStories] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [cleanScreen,setCleanScreen] = useState(false);
  const [stopAutoProgress, setStopAutoProgress] = useState(false);

  const storyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dtim = stories.storyType==='video'&&videoRef.current?.duration?videoRef.current?.duration*1000:5000;
  const handleNext = (e: any) => {
    if(e?.type==='click'){
      e.stopPropagation();
    };
    // Fetch the next story first
    const nextIndex = currentStory + 1;
    if (moreStories[nextIndex]) {
      // Update state before navigation
      navigate(`/stories/${storyUsername}/${moreStories[nextIndex]}?index=${nextIndex}`);
      setCurrentStory(nextIndex);
    }else{
      navigate('/')
    }
  };

  const handlePrev = (e: any) => {
    e.stopPropagation(); 
    // Fetch the next story first
    const nextIndex = currentStory - 1;
    
    if (moreStories[nextIndex]) {
      // Update state before navigation
      navigate(`/stories/${storyUsername}/${moreStories[nextIndex]}?index=${nextIndex}`);
      setCurrentStory(nextIndex);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // handleLeaveBtn
  const handleLeaveBtn = (e:any) => {
    if(e?.type==='click'){
      e.stopPropagation();
    }
    navigate('/');
  }

  // handle volume
  const handleVolume = (e:any) => {
    e.stopPropagation();
    if(videoRef.current){
      setIsMuted(!isMuted);
      if(isMuted){
        videoRef.current.muted = false;
      }else{
        videoRef.current.muted = true;
      }
    }
  }

  // handleStory
  const handleStory = (e:any) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    setStopAutoProgress(true);
    if(stories.storyType==='video'&&videoRef.current){
        if(isPlaying){
          videoRef.current.pause();
        }else{
          videoRef.current.play();
        }
    }
  }

  // get story
  useEffect(() => {
    (async ()=>{
      if(storyUsername&&!storyId){
        const res = await fetch(`${apiUrl}/stories/get-story/${storyUsername}`,{
          credentials: 'include',
        });
        const result = await res.json();
        setStories(result.data.stories);
        setMoreStories(result.data.more);
        setUser(result.data.user);
      }  
    })();

    return () => {
    }
  }, [storyUsername]);

  // get by id
  useEffect(() => {
    (async ()=>{
      if(storyUsername && storyId && index){
        const res = await fetch(`${apiUrl}/stories/get-story-by-id/${storyId}`,{
          credentials: 'include',
        });
        const result = await res.json();
        setStories(result.data.stories);
        setMoreStories(result.data.more);
        setUser(result.data.user);
      }  
    })();
  
    return () => {
    }
  }, [storyId,currentStory]);

  // get progress
  useEffect(() => {
    let interval: any;
    if(!stopAutoProgress&&stories.storyContent?.media){
      setProgress(0);
      if(currentStory===parseInt(index)){
       interval =setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval); // Clear interval when progress reaches 100%
            return 100;
          }
          return prevProgress + (100 / (dtim / 100)); // Increment progress
        });
      },100);
    }
    }
    return () => {
      clearInterval(interval);
    }
  }, [currentStory,index,stopAutoProgress,stories,dtim]);

  // get progress after click
  useEffect(() => {
    let interval: any;
    if(isPlaying&&stopAutoProgress&&stories.storyContent?.media){
      interval =setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval); // Clear interval when progress reaches 100%
          return 100;
        }
        return prevProgress + (100 / (dtim / 100)); // Increment progress
      });
    }, 100);
  }
    return () => {
      clearInterval(interval);
    }
  }, [currentStory,index,isPlaying,stories,stopAutoProgress,dtim]);

  useEffect(() => {
    setStopAutoProgress(false);
  }, [currentStory,index])

  useEffect(() => {
    if(stories.storyType&&moreStories.length){
    if(progress===100&&moreStories[currentStory+1]){
    handleNext({});  
    };

    if(progress===100&&!moreStories[Math.max(0, currentStory+1)]){
      handleNext({});
    }
  }
  }, [progress===100]);
console.log(progress)
console.log('dtim',dtim)
  // handle story features
  const handleMenu = (e: any) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }
  // handleCopyLink
  const handleCopyLink = (e: any) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowMenu(false);
    toast.success('Link Copied', {
      position: "bottom-right",
      hideProgressBar: true,
      theme: "dark",

    });
  }

  // story time manage 
  const storyTime = formatDistanceToNow(subHours(new Date(stories?.createAt?stories?.createAt:new Date()), 0));

  return (
    <div
      className={`relative w-full h-screen flex items-center justify-center bg-black ${isFullscreen ? 'fullscreen' : ''}`}
      onClick={toggleFullscreen}
    >
      <ToastContainer />
      {/* cross button */}
      <button onClick={handleLeaveBtn} className='text-white text-2xl absolute z-10 top-1 right-4'>
        <RxCross1/>
      </button>
      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-4 z-10 text-white text-3xl bg-gray-800 p-2 rounded-full transform -translate-y-1/2"
        onClick={handlePrev}
      >
        &#60;
      </button>

      {/* Story Display */}
      <div ref={storyRef} onClick={handleStory} className="relative overflow-hidden w-full sm:max-w-xs h-full max-h-[93%] aspect-w-9 aspect-h-16">
        {
          stories.storyType==='image' && <img
          src={stories?.storyContent?.media}
          alt={`Story ${currentStory + 1}`}
          ref={imgRef}
          className="w-full h-full object-cover"
        />}
        {stories.storyType==='video' && <video
          src={stories?.storyContent?.media}
          className="w-full h-full object-cover"
          autoPlay={true}
          ref={videoRef}
          muted={true}
        />
        }
        {/* stories text */}
        {/* <p
          className={`bg-gradient-to-r absolute top-[${yy}px] left-[${xx}px] z-20 from-blue-500 to-purple-500 outline-none border-none p-2`}
          style={{
            padding: '10px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {stories?.storyContent?.textContent}
        </p> */}

        {/* more features */}
        <div className={`text-2xl absolute z-30 ${cleanScreen?'hidden':''} flex gap-2 items-center z-10 top-4 right-4`}>
          {/* story time */}
        <p className='text-white text-base'>
        {storyTime.split(' ').length>2?storyTime.split(' ')[1]:storyTime.split(' ')[0]}{storyTime.split(' ').length>2?storyTime.split(' ')[2][0]:storyTime.split(' ')[1][0]}
        </p>
        {/* volume */}
        <button onClick={handleVolume} className={`text-white ${stories.storyType==='video'?'':'hidden'} text-2xl`}>
         {isMuted?<IoVolumeMuteOutline/>:<IoVolumeHighOutline/>}
       </button>
        <button onClick={handleMenu} className={`text-white rotate-90 text-2xl`}>
         <CiMenuKebab />
       </button>
        </div>
        {/*show menu  */}
        <div className={`absolute top-12 z-30 bg-white p-2 rounded-lg right-6 ${showMenu?'':'hidden'} flex flex-col gap-4`}>
        {/* Copy Link Button */}
        <button
          className="flex items-center text-sm gap-1 text-black font-semibold py-1 px-3 rounded-md hover:bg-gray-200"
          onClick={handleCopyLink}
        >
          <IoMdLink size={20} />
          <span>Copy Link</span>
        </button>
      </div>
       {/* profile and others*/}
        <div className={`absolute w-10 z-30 h-10 top-4 left-4 flex ${cleanScreen?'hidden':''} items-center space-x-2`}>
          <img
            src={user?.userAvatar||"/images/unknow user.jpg"}
            alt={user?.userFullname}
            className=" w-full h-full object-cover rounded-full border bg-black"
          />
        </div>
        <div className={`absolute z-30 bottom-4 w-56 left-1/2 flex gap-1 ${cleanScreen?'hidden':''} transform -translate-x-1/2`}>
        {moreStories.map((_, i) => (
          <div key={i} className="w-full h-1 bg-gray-600 relative">
           <div
              className="absolute top-0 left-0 h-full bg-white"
              style={{ width: `${currentStory === i ? progress : 0}%` }}
            ></div>
          </div>
        ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 right-4 z-10 text-white text-3xl bg-gray-800 p-2 rounded-full transform -translate-y-1/2"
        onClick={handleNext}
      >
        &#62;
      </button>
    </div>
  );
};

export default StoryView;
