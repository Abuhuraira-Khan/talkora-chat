import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext,MyProfileContext } from "./Context";

export const SocketContext = createContext<any>(null);

export const useSocketContext = () => {
    return useContext(SocketContext);
}

export const SocketContextProvider = ({ children }: any) => {

    const [socket, setSocket] = useState<any>();
    const [onlineUsers, setOnlineUsers] = useState<any>();
    const {auth} = useContext(AuthContext);
    const {myProfile} = useContext(MyProfileContext);

    // console.log(myProfile)

    useEffect(() => {
        if(auth){
            const newSocket = io("http://localhost:5000",{
                query: {
                    userId: myProfile?._id
                }
            })
            setSocket(newSocket);

            newSocket.on('getOnlineUsers',(users:any)=>{
                setOnlineUsers(users)
            })

            return () =>{
                newSocket.close();
            } 
        }else{
            if(socket){
                socket.close();
            }
        }
    },[auth,myProfile])


    return(
        <SocketContext.Provider value={{socket,onlineUsers}}>{children}</SocketContext.Provider>
    )
}


// listen messages
export const useListenMessages = ({ conversation, setConversation }: any) => {
    const { socket } = useSocketContext();
  
    useEffect(() => {
      if (socket) {

        const handleMessage = (details: any) => {
          if (details.message?.conversationId === conversation?._id) {
            setConversation((prevConversation: any) => ({
              ...prevConversation,
              messages: [...prevConversation.messages, details.message],
            }));
          }
        };
  
        socket.on('newMessage', handleMessage);
  
        return () => {
          socket.off('newMessage', handleMessage);
        };
      }
    }, [socket, conversation, setConversation]);
  };

  export const useListenLastMessages = ({ conversation, setConversation }: any) => {
    const { socket } = useSocketContext();
  
    useEffect(() => {
      if (socket) {
        const handleMessage = (details: any) => {
          // Check if there are conversations
          if (conversation.length) {
            const updatedConversations = conversation.map((conv: any) => {
              // Match the conversation by ID and update its last message
              if (conv.conversationId === details.message.conversationId) {
                return {
                  ...conv,
                  lastMessage: details.message.content,
                  senderId: details.sender._id,
                  lastMessageTime: details.message.createdAt,
                  updateAt: details.updatedAt,
                };
              }
              return conv; // Return unchanged conversation if not matched
            });

            // Update the state with the updated conversation array
            setConversation(updatedConversations);
          }
        };
  
        // Listen for new messages via Socket.IO
        socket.on('newMessage', handleMessage);
  
        // Cleanup the listener on unmount or dependency change
        return () => {
          socket.off('newMessage', handleMessage);
        };
      }
    }, [socket, conversation, setConversation]);
  };
  
  // use get conversations or new message
  export const useGetConversations = ({ conversation, setConversation }: any) => {
    const { socket } = useSocketContext();
    const {myProfile} = useContext(MyProfileContext);

    useEffect(() => {
      if (socket) {
        const handleMessage = (details: any) => {
          if(details.participants.includes(myProfile?._id)){
                      // Check if there are conversations
          const conversationExists = conversation.some((conv: any) => conv.conversationId === details.message.conversationId);
          
          const updatedConversations = conversation.map((conv: any) => {
            // Match the conversation by ID and update its last message
            if (conv.conversationId === details.message.conversationId) {
              return {
                ...conv,
                lastMessage: details.message.content,
                lastMessageTime: details.message.createdAt,
                updateAt: details.updatedAt,
              };
            }
            return conv; // Return the conversation unchanged if it doesn't match
          });
  
          // If the conversation doesn't exist, add it to the array
          if (!conversationExists&&details.participants.includes(myProfile?._id)) {
            updatedConversations.push({
              _id: details.message.conversationId,
              fullname: myProfile._id===details.sender._id?details.receiver.fullname: details.sender.fullname, // Replace with actual data if available
              username: myProfile._id===details.sender._id?details.receiver.username: details.sender.username, // Replace with actual data if available
              avatar: myProfile._id===details.sender._id?details.receiver.avatar: details.sender.avatar, // Replace with actual data if available
              isOnline: false, // Replace with actual data if available
              conversationId:  details.message.conversationId,
              lastMessage: details.message.content,
              lastMessageTime: details.message.createdAt,
              updateAt: details.updatedAt,
              participants: details.participants, // Replace with actual data if available
            });
          }
  
          // Update the state with the updated conversation array
          setConversation(updatedConversations);
        };
      }

  
        // Listen for new messages via Socket.IO
        socket.on('newConversation', handleMessage);
  
        // Cleanup the listener on unmount or dependency change
        return () => {
          socket.off('newConversation', handleMessage);
        };
      }
    }, [socket, conversation, setConversation]);
  };
  
  