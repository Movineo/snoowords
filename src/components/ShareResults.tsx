import React, { useState } from 'react';
import { Share2, Check, AlertCircle } from 'react-feather';
import { redditService } from '../services/redditService';
import { toast } from 'react-hot-toast';

interface ShareResultsProps {
  score: number;
  words: Array<{ word: string; points: number }>;
  playerName?: string;
}

export const ShareResults: React.FC<ShareResultsProps> = ({
  score,
  words,
  playerName = 'Anonymous'
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (isSharing || shared) return;

    setIsSharing(true);
    try {
      const success = await redditService.submitScore(
        score,
        words.map(w => w.word)
      );

      if (success) {
        setShared(true);
        toast.success('Score shared successfully!');
      } else {
        toast.error('Failed to share score. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing score:', error);
      toast.error('Failed to share score. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing || shared}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
        ${
          shared
            ? 'bg-green-600 hover:bg-green-700'
            : isSharing
            ? 'bg-purple-500 opacity-75 cursor-wait'
            : 'bg-purple-600 hover:bg-purple-700'
        }
      `}
    >
      {shared ? (
        <>
          <Check className="w-5 h-5" />
          Shared!
        </>
      ) : isSharing ? (
        <>
          <AlertCircle className="w-5 h-5 animate-pulse" />
          Sharing...
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" />
          Share to Reddit
        </>
      )}
    </button>
  );
};
