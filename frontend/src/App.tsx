import {  useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


// import components
import Login from './pages/Login';
import ChatList from './pages/ChatList';
import ChatWindow from './pages/ChatWindow';
import VideoCall from './pages/VideoCall';
import GroupVideoCall from './pages/GroupVideoCall';
import SignUp from './pages/SignUp';
import VerifyLogin from './pages/VerifyLogin';
import PeopleListPage from './pages/PeopleList';
import StoryStudio from './pages/StoryStudio';
import StoryViewer from './pages/StoryViewer';
import CreateGroup from './pages/CreateGroup';
import ProfilePage from './pages/Profile';

// import context
import { OpenSidebarContext } from './context/Context';
import { ProtectRoute } from './context/Context';

function App() {

  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <OpenSidebarContext.Provider value={{openSidebar, setOpenSidebar}}>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<VerifyLogin />} />
        {/* <Route path="/" element={<ChatList />} /> */}
        <Route path="/" element={
          <ProtectRoute>
            <ChatWindow />
          </ProtectRoute>
          } />
        <Route path="/c/:id" element={
          <ProtectRoute>
            <ChatWindow />
          </ProtectRoute>
          } />
        <Route path="/new" element={
          <ProtectRoute>
            <ChatWindow />
          </ProtectRoute>
          } />
        <Route path="/video-call" element={
          <ProtectRoute>
            <VideoCall />
          </ProtectRoute>
          } />
        <Route path="/group-video-call" element={
          <ProtectRoute>
            <GroupVideoCall />
          </ProtectRoute>
        } />
        <Route path='/people' element={
          <ProtectRoute>
            <PeopleListPage />
          </ProtectRoute>
        }/>
        <Route path='/manage-story' element={
          <ProtectRoute>
            <StoryStudio />
          </ProtectRoute>
        } />
        <Route path='/stories/:username/:id' element={
          <ProtectRoute>
            <StoryViewer />
          </ProtectRoute>
        } />
        <Route path='/stories/:username' element={
          <ProtectRoute>
            <StoryViewer />
          </ProtectRoute>
        } />
        <Route path='/create-group' element={
          <ProtectRoute>
            <CreateGroup />
          </ProtectRoute>
        } />
        <Route path='/profile/:username' element={
          <ProtectRoute>
            <ProfilePage />
          </ProtectRoute>
        } />
      </Routes>
    </Router>
    </OpenSidebarContext.Provider>
  );
}

export default App;
