import { createContext, useState, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

interface SidebarProps {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
}

interface AuthC {
  auth: boolean;
  setAuth: (value: boolean) => void;
}

// apiurl
export const apiUrl = "https://talkora-chat-api-production.up.railway.app";

export const TokenContext = createContext<any | null>(null);

const OpenSidebarContext = createContext<SidebarProps | null>(null); // or any other initial value

export { OpenSidebarContext };

export const AuthContext = createContext<AuthC>({
  auth: false,
  setAuth: () => {},
});

export const AuthProvider = ({ children }: any) => {
  const tokenL = localStorage.getItem("token");

  const [auth, setAuth] = useState(tokenL ? true : false);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <TokenContext.Provider value={tokenL}>
        {children}
        </TokenContext.Provider>
    </AuthContext.Provider>
  );
};

export const ProtectRoute = ({ children }: any) => {
  const authC = useContext(AuthContext);

  if (!authC.auth) {
    return <Navigate to="/login" />;
  }

  return children;
};

// MyProfileContext

export const MyProfileContext = createContext<any>({});

export const MyProfileProvider = ({ children }: any) => {
  const token = useContext(TokenContext);
  const [myProfile, setMyProfile] = useState<any>({});
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      if (auth) {
        const res = await fetch(`${apiUrl}/users/my-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setMyProfile(result.data);
        if (!res.ok) {
          setAuth(false);
        }
      }
    })();

    return () => {
      setMyProfile(null);
    };
  }, [auth]);

  return (
    <MyProfileContext.Provider value={{ myProfile, setMyProfile }}>
      {children}
    </MyProfileContext.Provider>
  );
};
