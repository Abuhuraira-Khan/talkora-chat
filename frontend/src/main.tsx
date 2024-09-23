import { StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css';
import { AuthProvider,MyProfileProvider } from './context/Context.tsx';
import { SocketContextProvider } from './context/SocketContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <MyProfileProvider>
    <SocketContextProvider>
     <App />
    </SocketContextProvider>
    </MyProfileProvider>
    </AuthProvider>
  </StrictMode>
)