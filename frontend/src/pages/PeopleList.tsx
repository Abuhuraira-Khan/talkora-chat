import React, { useState, useEffect ,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { MyProfileContext,apiUrl } from '../context/Context';

import { FaSearch } from "react-icons/fa";

interface Person {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
}


const PeopleListPage: React.FC = () => {

  const navigate = useNavigate();

  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const {myProfile} = useContext(MyProfileContext);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const getPeople = async () => {
        try {
          const res = await fetch(`${apiUrl}/users/peoples?s=${search}`, {
            credentials: 'include',
          });
          const result = await res.json();
          setPeople(result.data);
        } catch (error) {
          console.error('Failed to fetch people:', error);
        }
      };
      
      getPeople();
    }, 500); // Fetch people after 500ms debounce
  
    return () => clearTimeout(timeoutId); // Cleanup on unmount or before next call
  }, [search]);
  

  const handleMessageClick = (id:String) => { 
    const isChatTrue = myProfile?.chatList.some((chat:any) => chat.participants.includes(myProfile._id)&&chat.participants.includes(id)&&chat.isGroupChat==false);
    const getChatId = myProfile?.chatList.find((chat:any)=>chat.participants.includes(myProfile._id)&&chat.participants.includes(id)&&chat.isGroupChat==false);
    if(getChatId){
      navigate(`/c/${getChatId._id}`)
    }
    else if (!isChatTrue){
      navigate(`/new?with=${id}`)
    }
  }
  // const isChatTrue = chatList.some((chat) => chat === myProfile._id);
  // console.log(isChatTrue)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg p-6 rounded-b-xl mb-6">
        <h1 className="text-4xl font-extrabold">People Directory</h1>
        <p className="mt-2 text-lg">Connect with your network and discover new connections.</p>
      </header>

      <div className="max-w-4xl mx-auto bg-white p-6 shadow-xl rounded-xl border border-gray-300">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
          />
          <FaSearch size={20} className="absolute top-4 right-4 text-gray-400" />
        </div>

        <div className="space-y-6">
        {people?.map((person,idx) => {
          return (
<div
  key={idx}
  className="flex flex-col sm:flex-row items-center p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-r from-purple-50 to-blue-50"
>
  <img
    src={person.avatar || '/images/unknow user.jpg'}
    alt={person.fullname}
    className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-full object-cover mb-4 sm:mb-0 sm:mr-4"
  />
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
    <div className="flex flex-col items-center sm:items-start sm:flex-grow">
      <h2 className="text-xl overflow-hidden whitespace-nowrap text-ellipsis font-semibold text-gray-800">
        {person.fullname}
      </h2>
      <p className="text-gray-600">{person.username}</p>
      {/* <p className={`text-sm ${person.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
        {person.isOnline ? 'Online' : 'Offline'}
      </p> */}
    </div>
    <button
      onClick={() => handleMessageClick(person._id)}
      className="mt-4 sm:mt-0 sm:ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
    >
      Message
    </button>
  </div>
</div>

          )
        })}
        </div>
      </div>
    </div>
  );
};

export default PeopleListPage;
