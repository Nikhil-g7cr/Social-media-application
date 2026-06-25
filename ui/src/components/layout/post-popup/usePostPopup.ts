import { useContext } from 'react';
import { PostPopupContext } from './context/PostPopupContext';

export const usePostPopup = () => {
  const context = useContext(PostPopupContext);
  
  if (context === undefined) {
    throw new Error('usePostPopup must be used within a PostPopupProvider');
  }
  
  return context;
};
