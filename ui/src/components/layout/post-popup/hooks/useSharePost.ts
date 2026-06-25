import { useState, useCallback } from 'react';

export const useSharePost = (postId?: string) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyLink = useCallback(async () => {
    if (!postId) return;
    
    const link = `${window.location.origin}/post/${postId}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  }, [postId]);

  return { copyLink, isCopied };
};
