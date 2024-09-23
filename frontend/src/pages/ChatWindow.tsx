import { useEffect, useState, useContext, useRef, MouseEventHandler } from "react";
import {  toast } from "react-toastify";
import ChatList from "./ChatList";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Conversation } from "../context/types";
import { MyProfileContext,apiUrl } from "../context/Context";
import { IoIosSend } from "react-icons/io";
import { useGetConversations, useListenMessages } from "../context/SocketContext";
// import icon
import {FaEdit, FaTrash, FaShareAlt } from 'react-icons/fa';
import { RxDotsVertical } from "react-icons/rx";
import { BsGenderTrans } from "react-icons/bs";
import { FaAngleRight } from "react-icons/fa6";
import { IoIosAddCircle} from 'react-icons/io';
import { BiImageAdd } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { FaAngleLeft } from "react-icons/fa6";


import { formatDistanceToNow } from 'date-fns';
import {Loder4,LoaderBlur } from "./Loder";

interface ConversationProfile {
  _id: string;
  fullname: string;
  username: string;
  avatar: string;
  email: string;
  country: string;
  gender: string;
  messages:[];
}

export default function ChatWindow() {
  const { id } = useParams();
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  const newWith = searchParams.get('with');

  const messageBoxRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLParagraphElement>(null);

  const [text, setText] = useState('');
  const [isConversationDetails, setIsConversationDetails] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [receiver, setReceiver] = useState<ConversationProfile | null>(null);
  const [showMenu, setShowMenu] = useState<{ [key: string]: boolean }>({});
  useListenMessages({ conversation, setConversation });
  const {myProfile} = useContext<any>(MyProfileContext);

  const handleSend = async () => {
    if (newWith) {
      const res = await fetch(`${apiUrl}/chat/create-chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ receiver: newWith, text: text })
      });
      const result = await res.json();
      if (res.status === 200) {
        setText('');
        if (messageInputRef.current) {
          messageInputRef.current.innerText = '';
        }
        navigator('/c/' + result.data._id);
      }
    }
    if (id) {
      const res = await fetch(`${apiUrl}/message/send-message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conversationId: id, content: text })
      });
      const result = await res.json();
      if (res.status === 200) {
        setText('');
        if (messageInputRef.current) {
          messageInputRef.current.innerText = '';
        }
      }
    }
  };
  // get conversation
  useEffect(() => {
    (async () => {
      if (id) {
        const res = await fetch(`${apiUrl}/chat/get-chat/${id}`, {
          credentials: 'include'
        });
        const result = await res.json();
        setConversation(result.data);
      }
    })();
  }, [id]);

  // receiver profile
  useEffect(() => {
    (async () => {
      if (id || newWith) {
        const res = await fetch(`${apiUrl}/users/receiver-profile/${id || newWith}`, {
          credentials: 'include'
        });
        const result = await res.json();
        setReceiver(result.data);
      }
    })();
    return () => {
      setReceiver(null);
    };
  }, [id, newWith]);

  // scroll to bottom
  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleMenuToggle = (messageId: string) => {
    setShowMenu(prev => ({ ...prev, [messageId]: !prev[messageId] }));
  };


  // const handleEdit = (message: any) => {
  //   // Implement edit functionality
  // };

  const handleDelete = async (messageId: string) => {
    console.log(messageId)
    const res = await fetch(`${apiUrl}/message/delete-message`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({messageId: messageId})
    });
    if (res.status === 200) {
      setConversation((prev:any) => {
        if (prev) {
          return {
            ...prev,
            messages: prev.messages.filter((m: any) => m._id !== messageId)
          };
        }
      })
    }
  };

  // const handleShare = (message: any) => {
  //   // Implement share functionality
  // };

  return (
    <div className="flex h-screen bg-gradient-to-r box-border overflow-hidden from-blue-200 to-purple-300">
      <ChatList closeTab={() => setIsConversationDetails(false)} />
      {id || newWith ? (
        <main className={`flex-1 inline-block md:${id||newWith?'':'hidden'} overflow-hidden flex flex-col relative`}>
          {/* conversation details */}
          {isConversationDetails && <ConversationDetails closeTab={() => setIsConversationDetails(false)} id={receiver?._id} conversationId={id} />}
            {/* header */}
          <header className="flex items-center justify-between w-full pl-0 sm:pl-4 sm:p-4 py-2 bg-white shadow">
            <div className="flex items-center">
            <button onClick={() => navigator(-1)} className="sm:hidden text-3xl px-1" ><FaAngleLeft/></button>
              <div className="w-10 h-10 bg-purple-700 rounded-full overflow-hidden">
                <img src={receiver?.avatar||'/images/unknow user.jpg'} alt={receiver?.username} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg ml-2 font-medium">{receiver?.fullname}</h3>
            </div>
            {/* more */}
            <div className="flex items-center">
              <button onClick={() => setIsConversationDetails(true)} className="text-xl p-2 rounded-full hover:bg-gray-100"><RxDotsVertical /></button>
            </div>
          </header>
          <div ref={messageBoxRef} className="flex-1 p-4 flex flex-col-reverse overflow-y-auto">
            <div className="flex space-y-4 md:p-10 flex-col">
              {conversation?.messages?.map((message:any, idx:number) => (
                message._id?(
                <div key={idx} className={`relative ${message.sender === myProfile?._id ? 'self-end' : 'self-start '} max-w-[80vw] sm:max-w-xs md:max-w-sm `}>
                    {/* Sender Details */}
                  {message.sender !== myProfile?._id && (
                    <div className="flex items-center mb-1 space-x-2">
                      <img
                        src={message.senderDetails?.avatar} // Assuming senderDetails has avatarUrl
                        alt={message.senderDetails?.fullname} // Assuming senderDetails has fullName
                        className="w-7 h-7 rounded-full border border-gray-300"
                      />
                    </div>
                  )}

                  <div
                    className={`group relative ${message.sender === myProfile?._id
                      ? 'self-end bg-gray-300 text-gray-700'
                      : 'self-start bg-gradient-to-tr from-blue-500 to-purple-500 text-white'
                      } whitespace-pre-wrap break-words p-2 rounded-lg`}
                  >
                    {message.content}

                    {/* Three Dot Menu Button (shown on hover of the message content) */}
                    <button
                      onClick={() => handleMenuToggle(message._id)}
                      className={`three_dot absolute ${message.sender === myProfile?._id
                        ? 'left-[-20px]'
                        : 'right-[-20px]'
                        } top-1/4 transform-translate-y-1/2 text-black hover:text-gray-600 hidden group-hover:block`}
                    >
                      <RxDotsVertical size={20} />
                    </button>
                  </div>

                  {/* Time Indicator */}
                  <div className="text-xs bg-transparent text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(message.createdAt||Date.now()), { addSuffix: true })}
                  </div>
                  {showMenu[message?._id] && (
                    <div className={`absolute ${message.sender === myProfile?._id ? 'right-2' : 'left-2'} mt-2 w-48 z-20 bg-white text-black rounded-lg shadow-lg`}>
                      <ul>
                        {/* <li onClick={() => handleEdit(message)} className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
                          <FaEdit className="mr-2" /> Edit
                        </li> */}
                        <li onClick={() => handleDelete(message._id)} className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
                          <FaTrash className="mr-2" /> Delete
                        </li>
                        {/* <li onClick={() => handleShare(message)} className="flex items-center p-2 cursor-pointer hover:bg-gray-100">
                          <FaShareAlt className="mr-2" /> Share
                        </li> */}
                      </ul>
                    </div>
                  )}
                </div>
                ):null
              ))}
            </div>
          </div>
          <footer className="p-4 bg-transparent shadow flex justify-center items-center space-x-3">
            <p contentEditable={true} onInput={(e) => setText(e.currentTarget.innerText)} suppressContentEditableWarning
              ref={messageInputRef} className="px-4 py-2 border rounded-lg bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 overflow-y-auto">
            </p>
            <button onClick={handleSend} className="bg-purple-700 self-end text-white rounded hover:bg-purple-800 text-2xl px-6 py-2">
              <IoIosSend />
            </button>
          </footer>
        </main>
      ) : null}
    </div>
  );
}

interface IConversationDetailsProps{
  closeTab:MouseEventHandler<HTMLButtonElement>,
  id:string|undefined,
  conversationId:string|undefined
}

// Conversation Details
const ConversationDetails:React.FC<IConversationDetailsProps> = ({closeTab, id,conversationId})=>{

  const {myProfile,setMyProfile} = useContext<any>(MyProfileContext);
  const navigate = useNavigate();

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [seeMembers, setSeeMembers] = useState<boolean>(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [addMembersPage, setAddMembersPage] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationProfileDetails, setConversationProfileDetails] = useState<any>({});
  const [searchNewMembers, setSearchNewMembers] = useState<any[]>([]);
  const [thisAdmin, setThisAdmin] = useState<boolean>(false);
  const [isProfileEdit, setIsProfileEdit] = useState<boolean>(false);
  const [conversation, setConversation] = useState<any[]>([]);
  useGetConversations({conversation, setConversation});

  // state for optimization or loading
  const [isNewMembersAdded, setIsNewMembersAdded] = useState<any[]>([]);
  const [isNewMembersAddedL, setIsNewMembersAddedL] = useState('');
  const [isProfileEditL, setIsProfileEditL] = useState<boolean>(false);

  // get conversation profile
  useEffect(() => {
    (async () => {
      const red = await fetch(`${apiUrl}/users/get-conversation-profile/${id}/${conversationId}`,{
        credentials:'include'
      });
      const result = await red.json();
      setConversationProfileDetails(result.data);
    })();
  
    return () => {
      setConversationProfileDetails({});
    }
  }, [])

  // get members thats not include in the conversation
  useEffect(() => {
    setTimeout(async() => {
      const res = await fetch(`${apiUrl}/users/get-new-conversation-members/${conversationId}?s=${searchTerm}`,{
        credentials:'include'
      });
      const result = await res.json();
      setSearchNewMembers(result.data);
    }, 500);
  },[searchTerm])

  // add new members
  const handleAddNewMembers = async (id:string)=>{
    setIsNewMembersAddedL(id);
    const res = await fetch(`${apiUrl}/chat/add-new-members`,{
      method:'POST',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        newMembersId:[id],
        conversationId
      })
    });
    const result = await res.json();
    if(res.status === 200){
      setIsNewMembersAdded([...isNewMembersAdded,...result.data]);
    }
    setIsNewMembersAddedL('');
  }

  // get members
  useEffect(() => {
    if(seeMembers){
    (async () => {
      const res = await fetch(`${apiUrl}/chat/get-conversation-members/${conversationId}`,{
        credentials:'include'
      });
      const result = await res.json();
      setAllMembers(result.data);
      setThisAdmin(result?.data?.some((el:any)=>el.isAdmin.includes(myProfile?._id)));
    })();
  }
  },[seeMembers,isNewMembersAdded])

  // remove members
  const handleRemoveMember = async (id:string)=>{
    const res = await fetch(`${apiUrl}/chat/remove-members`,{
      method:'POST',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        membersId:[id],
        conversationId
      })
    });
    if(res.status === 200){
      setAllMembers((prev)=>prev.filter((el)=>el._id !== id));
    }
  }

  // empty search
  useEffect(() => {
    setSearchTerm('')
  }, [addMembersPage])

  // handleGroupEditChange
  const handleGroupEditChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.files && e.target.files[0]){
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setConversationProfileDetails((prev:any)=>({...prev,[e.target.name]:reader.result as string}));
      }
      reader.readAsDataURL(file);
    }

    setConversationProfileDetails((prev:any)=>({...prev,[e.target.name]:e.target.value}));
  }

  // handle edit group click
  const handleEditGroupClick = async ()=>{
    setIsProfileEditL(true);
    const res = await fetch(`${apiUrl}/chat/update-group-details/${conversationId}`,{
      method:'POST',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(conversationProfileDetails)
    });
    const result = await res.json();
    if(res.status === 200){
      toast.success(result.message);
      setIsProfileEditL(false);
      setIsProfileEdit(false);
    }else{
      toast.error(result.message);
      setIsProfileEditL(false);
      setIsProfileEdit(false);
    }
  }

  // handleDeleteOrLeaveChat
  const handleDeleteOrLeaveChat = async ()=>{
    const res = await fetch(`${apiUrl}/chat/delete-or-leave-chat/${conversationId}`,{
      method:'POST',
      credentials:'include',
      headers:{
        'Content-Type':'application/json'
      },
    });
    const result = await res.json();
    if(res.status === 200){
      toast.success(result.message);
      navigate('/');
    }
  }

  return(
    <div className="bg-white bg-opacity-50 shadow-lg p-5 min-h-screen h-screen w-full absolute top-0 right-0 z-40 ">
      <div className={`bg-white ${addMembersPage?'hidden':''} relative mt-14 left-1/2 translate-x-[-50%] rounded-lg max-h-full w-full sm:w-3/5 overflow-y-auto overflow-hidden`}>
      {/* loader */}
      {isProfileEditL?<LoaderBlur/>:null}
      {/* close buton */}
      <button onClick={closeTab} className="absolute top-5 px-2 p-1 hover:bg-gray-200 rounded-full right-5 capitalize">close</button>
      {/* edit button */}
      <button onClick={()=>setIsProfileEdit(!isProfileEdit)} className={`absolute text-xl top-5 px-2 p-1 hover:bg-gray-200 ${conversationProfileDetails?.isGroupChat?'':'hidden'} rounded-full left-5 capitalize`}><AiOutlineEdit/></button>
      <button onClick={handleEditGroupClick} className={`absolute ${isProfileEdit?'':'hidden'} top-5 left-16 capitalize px-1 text-white bg-blue-500 rounded`}>save</button>
        {/* profile */}
        <div className="w-full items-center py-4 overflow-hidden px-3 sm:px-20 flex flex-col" >
          {/* avatar */}
          <div className={`w-40 rounded-full ${conversationProfileDetails?.isGroupChat?'overflow-hidden':''}  h-40 relative`}>
            <button className={`absolute w-full h-full top-0 left-0 bg-white bg-opacity-35 ${isProfileEdit?'':'hidden'} flex items-center justify-center`}><span onClick={()=>avatarInputRef.current?.click()} className="text-4xl"><BiImageAdd/></span></button>
            <input onChange={handleGroupEditChange} ref={avatarInputRef} type="file" className="hidden" name="avatar" />
            <p className="absolute top-0 right-0 text-white text-xs bg-gray-600 rounded">{conversationProfileDetails?.isGroupChat?'':conversationProfileDetails?.highlights}</p>
            <img className="w-full h-full rounded-full object-cover" src={conversationProfileDetails?.avatar||"/images/unknow user.jpg"} alt="" />
          </div>
          {/* other information */}
          <div className="flex flex-col items-center mt-4 text-gray-700">
            <input onChange={handleGroupEditChange} disabled={!isProfileEdit} value={conversationProfileDetails.isGroupChat?conversationProfileDetails.groupName:conversationProfileDetails.fullname} className={`text-xl text-center bg-transparent ${isProfileEdit?'border-2 border-black rounded px-2 py-1':''} font-bold`} name="groupName" />
            <p className="text-sm font-semibold">{conversationProfileDetails.isGroupChat?'':'@'+conversationProfileDetails.username}</p>

            <p className="flex gap-4 mt-1">
              <span className="flex capitalize items-center gap-1">{conversationProfileDetails?.isGroupChat?'':<BsGenderTrans/>} {conversationProfileDetails?.gender||''}</span>
              <span>{conversationProfileDetails?.isGroupChat?'':conversationProfileDetails?.country}</span>
            </p>
            <p className={`mt-3 text-center`}>
              {conversationProfileDetails?.isGroupChat?conversationProfileDetails?.description:conversationProfileDetails?.bio}
            </p>
          </div>
        </div>

        {/* setting */}
        <div className="bg-gray-500 mt-6 px-1 py-2 rounded-tr-lg rounded-tl-lg ">
          <div className="flex flex-col font-semibold capitalize cursor-context-menu gap-1">
            <div className={`hover:bg-white hover:text-black max-h-96  sidebar-main-scrollbar rounded-md p-1 px-3 ${seeMembers?'overflow-y-auto text-black bg-white':'h-[32px] overflow-hidden text-white'} ${conversationProfileDetails?.isGroupChat?'':'hidden'}`}>
              <div onClick={() => setSeeMembers(!seeMembers)} className="flex justify-between items-center">Membars <FaAngleRight/></div>
              <div className="mt-2">
                {thisAdmin && (
                  <div onClick={() => setAddMembersPage(true)} className="capitalize sticky top-0 flex items-center text-black gap-1 px-2 py-1 rounded-lg bg-gray-300 hover:bg-gray-400"><IoIosAddCircle size={20} /> add member</div>
                )}
                <div className="mt-2">
                  {seeMembers && allMembers.map((member, i) => (
                    <div key={i} className="flex bg-gray-600 mb-1 px-2 py-1 rounded-lg items-center gap-1 justify-between">
                      <div className="flex shrink w-full overflow-hidden items-center gap-2">
                        <img className="w-10 h-10 object-cover bg-black rounded-full" src={member.avatar||'/images/unknow user.jpg'} alt="" />
                        <p className="whitespace-nowrap grow w-1 text-white overflow-hidden text-ellipsis">{member.fullname}</p>
                      </div>
                      <p className={`text-green-500 ${member.isAdmin==member._id?'':'hidden'}`}>admin</p>
                      {thisAdmin && (
                        <button onClick={()=>{handleRemoveMember(member._id)}} className={`bg-red-500  text-white text-sm px-2 py-1 rounded`}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div onClick={handleDeleteOrLeaveChat} className="hover:bg-white hover:text-black text-white rounded-md p-1 px-3">{conversationProfileDetails?.isGroupChat?'leave group':'delete chat'}</div>
          </div>
        </div>

      </div>
      {/* search */}
      <div className={` ${addMembersPage ? '' : 'hidden'} max-w-2xl w-full sm:w-3/5 relative mt-14 left-1/2 translate-x-[-50%] max-h-full bg-white  shadow-lg rounded-lg p-6`}>
        <button onClick={() => setAddMembersPage(false)} className="absolute top-1 px-2 p-1 hover:bg-gray-300 rounded-full left-1 capitalize">back</button>
        {/* Search Bar */}
        <div className="relative mt-4 mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-200"
          />
        </div>

        {/* User List */}
        <ul className="divide-y h-[80%] overflow-y-auto divide-gray-200 mb-2">
          {searchNewMembers?.map((user, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition duration-150 ease-in-out mb-3 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img src={user.avatar || 'images/unknow user.jpg'} alt={user.username} className="h-12 w-12 rounded-full border object-cover shadow-md" />
                <span className="text-gray-800 font-medium text-lg">{user.fullname}</span>
              </div>
              <button
                className={`py-2 px-4 text-sm capitalize ${isNewMembersAdded.includes(user._id)?'bg-gray-500':'bg-purple-500'} text-white border rounded-lg shadow`}
              onClick={() => handleAddNewMembers(user._id)}
              >
                {isNewMembersAdded.includes(user._id)?'added':isNewMembersAddedL.includes(user._id)?<Loder4/>:'add'}
              </button>
            </li>
          )
          )}
        </ul>
      </div>
    </div>
  )


}
