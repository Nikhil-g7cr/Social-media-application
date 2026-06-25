import React from 'react';
import type { PopupPayload } from '../types';
import { useSharePost } from '../hooks/useSharePost';

interface SharePostScreenProps {
  payload?: PopupPayload;
  onClose: () => void;
}

const SharePostScreen: React.FC<SharePostScreenProps> = ({ payload, onClose }) => {
  const { copyLink, isCopied } = useSharePost(payload?.postId);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Share Post</h2>
      <p className="text-gray-600 mb-6">Copy the link below to share this post with others.</p>
      
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          readOnly 
          value={`${window.location.origin}/post/${payload?.postId || ''}`}
          className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 focus:outline-none"
        />
        <button 
          onClick={copyLink}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            isCopied ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-5 py-2 font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SharePostScreen;
