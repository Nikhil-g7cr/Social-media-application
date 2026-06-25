import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePostPopup, PostPopupMode } from '../../components/layout/post-popup';
import HomePage from '../Home';

const PostDeepLink: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { open } = usePostPopup();

  useEffect(() => {
    if (postId) {
      open(PostPopupMode.VIEW, { postId });
      // Clear the URL so if they close it they just see the feed
      navigate('/', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [postId, open, navigate]);

  // Render HomePage so there's a background while the popup opens
  return <HomePage />;
};

export default PostDeepLink;
