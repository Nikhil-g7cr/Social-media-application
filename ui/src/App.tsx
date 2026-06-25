import { useEffect } from 'react';
import './App.css';
import Approutes from './routes';
import { useAppDispatch } from './redux/hooks';
import { initializeSocket } from './utils/socket';
import { setOnlineUsers, userOnline, userOffline } from './redux/features/onlineUsers/onlineUsersSlice';
import { PostPopupProvider } from './components/layout/post-popup';
function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // We only want to initialize the socket if the user is authenticated, 
    // but the socket logic itself can handle it if there's no token.
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const socket = initializeSocket();

    socket.on('syncOnlineUsers', (userIds: string[]) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.on('userOnline', (userId: string) => {
      dispatch(userOnline(userId));
    });

    socket.on('userOffline', (userId: string) => {
      dispatch(userOffline(userId));
    });

    return () => {
      socket.off('syncOnlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [dispatch]);

  return (
    <PostPopupProvider>
      <Approutes/>
    </PostPopupProvider>
  )
}

export default App;
