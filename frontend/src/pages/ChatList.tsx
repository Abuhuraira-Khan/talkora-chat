import Sidebar from "./Sidebar";
import React,{ useContext,useEffect,useState,useMemo } from "react";
import { OpenSidebarContext,MyProfileContext,apiUrl,TokenContext } from "../context/Context";
// import {User} from '../context/types';
import { useGetConversations, useListenLastMessages } from "../context/SocketContext";
import { formatDistanceToNow } from 'date-fns';
// import icon
import { FaAngleRight } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { IoIosAddCircle, IoIosCloseCircle } from 'react-icons/io';
import { FiUsers } from 'react-icons/fi';
// import { RiChatPrivateLine } from "react-icons/ri";
import { useNavigate,useSearchParams,useParams } from "react-router-dom";
import { useSocketContext } from "../context/SocketContext";
import { LoaderBlur } from "./Loder";

interface SidebarProps {
  openSidebar: boolean,
  setOpenSidebar: (value: boolean) => void;

}

export default React.memo(function ChatList({closeTab}:any) {

  const token = useContext(TokenContext);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const newWith = searchParams.get('with');

  const navigate = useNavigate();

  const sideBarC = useContext<SidebarProps|null>(OpenSidebarContext);

  const {myProfile}= useContext<any>(MyProfileContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // online users
  const {onlineUsers} = useSocketContext();

  // stories
  const [stories, setStories] = useState<any[]>([]);
  // get conversations
  const [conversation, setConversation] = useState<any[]>([]);
  useListenLastMessages({ conversation, setConversation });
  useGetConversations({ conversation, setConversation });

  // highlight 
  const [showHighlight, setShowHighlight] = useState<string>(``);

  // get stories
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await fetch(`${apiUrl}/stories/get-connected-stories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();
      setStories(result.data||[]);
      setIsLoading(false);
    })();
  
    return () => {
      setStories([]);
    }
  }, [])

  // get chat user
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const res = await fetch(`${apiUrl}/users/get-chat-user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();
      setConversation(result.data);
      setIsLoading(false);
    })();

    return () => {
      setConversation([]);
    };
  }, []);

  return (
    <div onClick={closeTab} className={`h-screen ${id||newWith ? "hidden" : ""} sm:block w-full sm:w-80 bg-gray-100 overflow-hidden`}>
      <Sidebar/>
      {/* w-64 */}
      <aside className={`${sideBarC?.openSidebar ? 'w-0':'w-full sm:w-80'} group h-full overflow-hidden inline-block relative transition-all duration-300 sm:max-w-80 bg-white shadow-lg`}>
        <div className="p-4 h-full overflow-y-auto chatList-chat-scrollbar">
        <div className="mb-4 flex items-center gap-1">
          <button onClick={()=>sideBarC?.setOpenSidebar(!sideBarC.openSidebar)} className="rounded-full bg-gray-100 hover:bg-gray-200 p-2 text-2xl font-bold"><FaAngleRight/></button>
          <h2 onClick={()=>navigate('/')} className="text-xl cursor-pointer font-bold">Chats</h2>
        </div>
        {isLoading ? <LoaderBlur /> : (
        <>
        {/* Create New Floating Button */}
        <div className={`absolute bottom-6 right-4 z-10 transition-all duration-300 scale-100 ${isDropdownOpen ? "sm:scale-100" : "sm:group-hover:scale-100 sm:scale-0"}`}>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            {/* Conditional rendering of icon based on isDropdownOpen */}
            {isDropdownOpen ?<IoIosCloseCircle size={24} />: <IoIosAddCircle size={24} />}
            {/* Conditional rendering of text */}
            <span className="font-medium transition-all duration-300">{isDropdownOpen ? "Close All" : "Create New"}</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-16 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <ul className="py-2">
                {/* New Group */}
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => {navigate('/create-group'); setDropdownOpen(false)}}
                >
                  <div className="border border-gray-300 rounded-full p-2">
                    <FiUsers size={18} />
                  </div>
                  New Group
                </li>

                {/* New Channel */}
                {/* <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="border border-gray-300 rounded-full p-2">
                    <FiRadio size={18} />
                  </div>
                  New Channel
                </li> */}

                {/* New Chat */}
                {/* <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="border border-gray-300 rounded-full p-2">
                    <RiChatPrivateLine size={18} />
                  </div>
                  New Private Chat
                </li> */}
              </ul>
            </div>
          )}
        </div>
        </div>
        {/* stories */}
        <div className="pb-3 max-w-full w-full">
          <div className="w-full flex items-center relative gap-1 overflow-y-hidden overflow-x-auto">
            <p className={`text-white ${showHighlight ? "scale-100" : "scale-0"} transition-all duration-100 scale-0 w-[200px] p-4 max-h-16 chatList-chat-scrollbar overflow-y-auto z-50 rounded absolute top-0 left-1/2 -translate-x-1/2 text-xs bg-gray-600`}>
            <button onClick={()=>setShowHighlight(``)} className="absolute top-0 right-0 p-1"><RxCross2/></button>
            <span>{showHighlight} </span>
            </p>
            {/* add story */}
            <div className={`flex-shrink-0 cursor-pointer w-14 h-14 p-[3px] relative ${myProfile?.stories?.length?"bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gray-300"} rounded-full`}>
              <div onClick={()=>myProfile?.stories.length&&navigate(`/stories/${myProfile?.username}`)} className="w-full h-full border-2 border-white overflow-hidden rounded-full">
                <img className="w-full h-full object-cover" src={myProfile?.avatar} alt="" />
              </div>
              <button onClick={()=>navigate('/manage-story')} className=" rounded-full z-10 bg-white absolute top-0 left-0 flex justify-center items-center">
              <IoIosAddCircle size={25} color="black"/>
              </button>
            </div>
            {stories?.map((storyUser,idx)=>{
              return(
                <div key={idx} className="relative p-1">
                <p onClick={()=>setShowHighlight(storyUser.highlights)} className={`text-white whitespace-nowrap text-ellipsis p-[2px] ${storyUser.highlights?'':'hidden'} overflow-hidden w-11/12 z-10 rounded absolute top-0 right-0 text-xs bg-gray-600`}>{storyUser.highlights}</p>
                <div className=" flex-shrink-0 cursor-pointer w-14 h-14 p-[3px] relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-full overflow-hidden">
                <div onClick={()=>navigate(`/stories/${storyUser?.username}`)} className="w-full h-full border-2 border-white overflow-hidden rounded-full">
                <img className="w-full h-full object-cover" src={storyUser?.avatar||'/images/unknow user.jpg'} alt="" />
                </div>
              </div>
              </div>
              )
            })}
          </div>
        </div>
        {/* all chats */}
        <ul className="space-y-3">
          {myProfile?._id && conversation?.length > 0 ? (
              conversation.sort((a: any, b: any) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()).map((chat, idx) => (
              <ChatUser
              key={idx}
              onlineUsers={onlineUsers}
              chat={chat}
              sideC={sideBarC?.openSidebar}
              myId={myProfile?._id}
            />
            ))
          ) : (
            <li className="text-center mt-[10vh]  text-gray-500">You have no chat</li>
          )}
        </ul>
        </>
        )
        }
        </div>
      </aside>
    </div>
  );
})

// chat user componennt

interface Chat {
  _id: String;
  fullname: String;
  username: String;
  avatar?: string;
  conversationId: String;
  isGroupChat: Boolean;
  groupAvatar?: String;
  groupName?: String;
  lastMessageTime: Date;
  lastMessage: String;
  senderId: String;
  participants: String[];
}

interface ChatUserProps {
  chat: Chat,
  sideC:undefined | boolean,
  myId: String,
  onlineUsers: String[]
}

interface ChatUser {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  chatId: string;
  chatName: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: string;
  lastMessageSenderName: string;
}

const ChatUser: React.FC<ChatUserProps> = React.memo(({ chat, sideC, myId,onlineUsers }) => {
  const navigate = useNavigate();

  const otherParticipantId = useMemo(
    () => chat.participants.find((id: String) => id !== myId),
    [chat.participants, myId]
  )
  // Check if the user is online by seeing if their ID is in onlineUsers
  const isOnline = useMemo(
    () => onlineUsers?.includes(otherParticipantId || ''),
    [onlineUsers, otherParticipantId]
  )
  const timeArray = formatDistanceToNow(new Date(chat.lastMessageTime)).split(' ');

  return (
    <li
      onClick={() => navigate(`/c/${chat.conversationId}`)}
      className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-purple-700 overflow-hidden rounded-full flex-shrink-0">
            <img
              src={chat?.avatar||`${chat?.isGroupChat?'/images/group user.webp':'/images/unknow user.jpg'}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online status indicator dot */}
          {isOnline && (
            <span className="absolute left-0 top-0 w-3 h-3 bg-green-500 border-2 border-gray-200 rounded-full"></span>
          )}
        </div>
        <div className="overflow-hidden">
          <h3
            className={`text-sm ${sideC ? 'w-20' : 'w-52'} font-medium whitespace-nowrap text-ellipsis overflow-hidden`}
          >
            {chat?.fullname}
          </h3>
          <p className="text-xs flex gap-1 text-gray-500 w-2/3 overflow-hidden">
          <span className="whitespace-nowrap max-w-full text-ellipsis overflow-hidden">{chat?.senderId==myId?'You: ':''}{chat?.lastMessage}</span>
          <span className={`text-xs ${chat?.lastMessage!=='No messages yet'?'':'hidden'} text-gray-500 whitespace-nowrap`}>&middot; {timeArray.length > 2?timeArray[1]:timeArray[0]}{timeArray.length > 2?timeArray[2][0]:timeArray[1][0]}</span>
          </p>
        </div>
      </div>
    </li>
  );
});

