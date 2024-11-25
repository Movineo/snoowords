import React from 'react';
import { Share2, MessageSquare } from 'lucide-react';
import { Word } from '../types';
import { toast } from 'react-hot-toast';

interface ShareResultsProps {
  score: number;
  words: Word[];
  playerName?: string;
  onShareReddit?: () => Promise<void>;
}

export const ShareResults: React.FC<ShareResultsProps> = ({ 
  score, 
  words, 
  playerName = 'Anonymous', 
  onShareReddit 
}) => {
  const generateShareText = () => {
    const topWords = words
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)
      .map(w => `${w.word} (${w.points}pts)`)
      .join(', ');

    const wordCount = words.length;
    const avgScore = Math.round(score / wordCount);

    return `🎮 SnooWords Results 🎮\n` +
           `Player: ${playerName}\n` +
           `🏆 Score: ${score} points\n` +
           `📚 Words Found: ${wordCount}\n` +
           `⭐ Avg Points/Word: ${avgScore}\n` +
           `🌟 Best Words: ${topWords}\n\n` +
           `🎯 Can you beat my score? Play SnooWords now!`;
  };

  const handleRedditShare = async () => {
    if (onShareReddit) {
      try {
        await onShareReddit();
        toast.success('Score shared to Reddit!');
      } catch (error) {
        toast.error('Failed to share to Reddit');
      }
    } else {
      const text = generateShareText();
      const subreddit = 'SnooWords';
      const title = `[Score] ${playerName}'s SnooWords Game Result: ${score} points!`;
      const url = `https://reddit.com/r/${subreddit}/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const handleCopyToClipboard = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Results copied to clipboard!'))
      .catch(() => toast.error('Failed to copy results'));
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleRedditShare}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
        Share to Reddit
      </button>
      <button
        onClick={handleCopyToClipboard}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Share2 className="w-5 h-5" />
        Copy
      </button>
    </div>
  );
};
