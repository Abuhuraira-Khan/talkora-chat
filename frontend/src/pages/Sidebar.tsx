import { useContext } from "react";
import { OpenSidebarContext, MyProfileContext } from "../context/Context";
import { useCookies } from "react-cookie";
import { Link,useNavigate } from "react-router-dom";
// import { User } from '../context/types';
// import { IoSettingsOutline } from "react-icons/io5";
import { LuUserCircle2 } from "react-icons/lu";
// import { PiUserSwitch } from "react-icons/pi";
import { FiLogOut } from "react-icons/fi";
// import { FaAngleRight } from "react-icons/fa6";
import { SlPeople } from "react-icons/sl";
// import { MdOutlineWebStories } from "react-icons/md";
import { FaAngleLeft } from "react-icons/fa6";

interface OpenSidebarProps {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
}

const Sidebar = () => {
  const sideBarC = useContext<OpenSidebarProps | null>(OpenSidebarContext);
  const {myProfile} = useContext<any>(MyProfileContext);
  const [,,removeCookie] = useCookies(['u_token']);
  const navigate = useNavigate();

  return (
    <aside className={`${sideBarC?.openSidebar ? 'w-full md:w-80' : 'w-0'} inline-block overflow-hidden overflow-y-auto relative transition-all duration-300 h-full bg-white sidebar-main-scrollbar`}>
      {/* Toggle Button */}
      <button
        onClick={() => sideBarC?.setOpenSidebar(!sideBarC.openSidebar)}
        className="absolute top-[10px] right-0 p-2 z-10 text-2xl font-bold rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none"
      >
        <FaAngleLeft/>
      </button>

      {/* header */}
      <div className="h-[100vw] max-h-[500px] sm:h-80 relative w-full">
        <div className="h-full relative w-full overflow-hidden">
          <img className="h-full w-full object-cover" src={myProfile?.avatar} alt={myProfile?.username} />
        </div>
        <div className="bg-gradient-to-t from-black p-2 min-w-full text-white absolute left-0 bottom-0">
          <h2 className="text-md font-semibold">{myProfile?.fullname}</h2>
          <p className="text-sm">@{myProfile?.username}</p>
        </div>
      </div>
      {/* main */}
      <div style={{ scrollbarWidth: 'none' }} className=" max-h-80 overflow-y-auto">
        {/* main navigater */}
        <div className="flex flex-col p-1 capitalize font-semibold">
          {/* <a href="" className="flex items-center gap-2 flex-wrap rounded hover:bg-gray-200 p-2">
            <span><IoSettingsOutline size={22} /></span>
            <span>settings</span>
          </a> */}
          <Link to={`/profile/${myProfile?.username}`} className="flex items-center gap-2 flex-wrap rounded hover:bg-gray-200 p-2">
            <span><LuUserCircle2 size={22} /></span>
            <span>profile</span>
          </Link>
          <Link to="/people" className="flex items-center gap-2 flex-wrap rounded hover:bg-gray-200 p-2">
            <span><SlPeople size={22} /></span>
            <span>people</span>
          </Link>
          {/* <a href="" className="flex items-center gap-2 flex-wrap rounded hover:bg-gray-200 p-2">
            <span><MdOutlineWebStories size={22} /></span>
            <span>stories</span>
          </a> */}
        </div>
        {/* group chats */}
        {/* <div className="capitalize font-semibold p-1"> */}
          {/* <h3 className="flex space-x-1 pb-1 px-2 items-center"><span>group chats</span> <span><FaAngleRight /></span></h3> */}
          {/* chats list */}
          {/* <div className="overflow-hidden px-2"> */}
            {/* <ul> */}
              {/* Repeat these list items as necessary */}
              {/* <li className="p-2 bg-gray-200 rounded mb-2 hover:bg-gray-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-700 rounded-full flex-shrink-0"></div>
                  <div>
                    <h3 className="text-sm w-32 font-medium whitespace-nowrap text-ellipsis overflow-hidden">{"name"}</h3>
                    <p className="text-xs text-gray-500">Last message...</p>
                  </div>
                </div>
              </li> */}
              {/* ... other list items */}
              {/* <button className="text-sm text-blue-500 capitalize hover:underline">see all</button> */}
            {/* </ul> */}
          {/* </div> */}
        {/* </div> */}
      </div>
      {/* footer */}
      <div className="capitalize absolute bottom-0 left-0 w-full font-semibold mt-1 border-t-2 border-gray-200 flex flex-col gap-2 p-1">
        <button onClick={() =>{removeCookie('u_token'); navigate('/login')}} className="bg-red-500 text-white items-center py-2 rounded hover:bg-red-600 flex gap-1 justify-center">Log out <span><FiLogOut size={20} /></span></button>
      </div>
    </aside>
  );
};

export default Sidebar;
