import { useEffect } from "react";
import "./App.css";
import Approutes from "./routes";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { initializeSocket } from "./utils/socket";
import {
  setOnlineUsers,
  userOnline,
  userOffline,
} from "./redux/features/onlineUsers/onlineUsersSlice";
import { PostPopupProvider } from "./components/layout/post-popup";
function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = initializeSocket();

    socket.on("syncOnlineUsers", (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("userOnline", (userId: string) => {
      dispatch(userOnline(userId));
    });

    socket.on("userOffline", (userId: string) => {
      dispatch(userOffline(userId));
    });

    return () => {
      socket.off("syncOnlineUsers");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [dispatch, isAuthenticated]);

  return (
    <PostPopupProvider>
      <Approutes />
    </PostPopupProvider>
  );
}

export default App;
