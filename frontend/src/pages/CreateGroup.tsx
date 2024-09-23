import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsGenderTrans } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa6";
import { apiUrl } from '../context/Context';


interface SelectedUser {
  _id: string;
  fullname: string;
  username: string;
  avatar: string;
  gender: string;
  country: string;
  bio: string;
}


const NewGroup = () => {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<SelectedUser|null>(null);
  const [isCardVisible, setIsCardVisible] = useState('');
  const [userList,setUserList] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [isGroupNmaeInput, setIsGroupNmaeInput] = useState<boolean>(false);

  const handleViewDetails = (id: string) => {
    setIsCardVisible(id); // Show the card when a user is selected
  };

  const handleCloseCard = () => {
    setIsCardVisible(''); // Hide the card
    setSelectedUser(null);
  };
  
  // handleChnageSelectParticipant
  const handleChnageSelectParticipant = (id: string) => {
    if(participants.includes(id)) {
      setParticipants(participants.filter((participant) => participant !== id));
    }else{
      setParticipants([...participants, id]);
    }
  }

  const handleCreateGroup = async () => {
    setIsGroupNmaeInput(true);
    if(groupName) {
      console.log('first')
      const res = await fetch(`${apiUrl}/chat/create-group`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        credentials:'include',
        body: JSON.stringify({
          groupName,
          participants
        })
      });
      const result = await res.json();
      if(res.status === 200) {
        navigate(`/c/${result.data._id}`);
    }else{
      alert(result.message);}
  }
  };

  // dom refarence style
  useEffect(() => {
    if(location.pathname === '/create-group') {
      document.body.style.overflow = 'hidden';
    }
  
    return () => {
      
    }
  }, [])

  // get user thats include in chatList
  useEffect(() => {
    setTimeout(async () => {
        const res = await fetch(`${apiUrl}/users/get-users-for-create-group?s=${searchTerm}`,{
          credentials:'include'
        });
  
        const result = await res.json();
        setUserList(result.data)
    },500)
  
    return () => {
      
    }
  }, [searchTerm])

  // get selected user
  useEffect(() => {
    (async () => {
      if(isCardVisible) {
        const res = await fetch(`${apiUrl}/users/get-user/${isCardVisible}`,{
          credentials:'include'
        });
  
        const result = await res.json();
        setSelectedUser(result.data)
      }
    })();
  
    return () => {
      
    }
  }, [isCardVisible])
  
  return (
    <div className="p-1 bg-gradient-to-r h-[100vh] max-h-[95vh] from-blue-50 via-white to-purple-50 min-h-screen">
      <button onClick={()=>navigate('/')} className="absolute sm:hidden top-0 left-2 text-xl p-2"><FaArrowLeft/></button>
      {/* group name input */}
      <div className={`fixed w-[100vw] h-[100vh] ${isGroupNmaeInput ? '' : 'hidden'} flex items-center justify-center p-5 top-0 left-0 bg-black bg-opacity-50 z-40`}>
        <div className='bg-white p-4 rounded-lg shadow-lg z-40 w-full sm:w-2/4 mx-auto'>
          <input onChange={(e:any)=>setGroupName(e.target.value)} type="text" placeholder="Group Name*" className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-200" />
          <div className='py-3'>
            <button onClick={()=>setIsGroupNmaeInput(false)} className='text-blue-500 py-1 px-2 hover:bg-gray-200 rounded capitalize'>back</button>
          </div>
          <div className='flex justify-end'>
            <button onClick={handleCreateGroup} className='bg-purple-500 capitalize text-white px-4 py-2 rounded'>Create</button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl h-full mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
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
          {userList?.map((user,idx) => (
              <li
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition duration-150 ease-in-out mb-3 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <input onChange={() => handleChnageSelectParticipant(user._id)} type="checkbox" className="form-checkbox h-5 w-5 text-purple-600 rounded" />
                  <img src={user.avatar||'images/unknow user.jpg'} alt={user.username} className="h-12 w-12 rounded-full border object-cover shadow-md" />
                  <span className="text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis font-medium text-lg">{user.fullname}</span>
                </div>
                <button
                  className="py-1 px-2 ml-[2px] bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition duration-200"
                  onClick={() => handleViewDetails(user._id)}
                >
                  Details
                </button>
              </li>
            )
          )}
        </ul>

        {/* Create Group Button */}
        <button
          className="w-full py-3 bg-gradient-to-r to-blue-500 from-purple-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
          onClick={handleCreateGroup}
        >
          Create Group
        </button>
      </div>

      {/* Sliding Details Card */}
      {selectedUser && (
        <div
          className={`fixed sm:w-[750px] h-1/2 bottom-0 left-0 right-0 sm:left-1/2 sm:translate-x-[-50%] bg-white shadow-lg rounded-t-3xl p-6 transition-all duration-300 ${
            isCardVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">{selectedUser?.fullname}</h3>
            <button
              onClick={handleCloseCard}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="mt-4">
            <img
              src={selectedUser.avatar||'images/unknow user.jpg'}
              alt={selectedUser.username}
              className="h-24 w-24 rounded-full mx-auto border object-cover shadow-md"
            />
            <p className='text-center text-gray-600 font-semibold mt-3'>@{selectedUser.username}</p>
            <p className='justify-center mt-2 flex gap-4 text-gray-600 rounded'>
              <span className='flex capitalize items-center gap-1'><BsGenderTrans/>{selectedUser.gender}</span>
              <span>{selectedUser.country}</span>
            </p> 

            <p className="text-center mt-1 text-gray-600">{selectedUser.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGroup;
