import React, { useEffect, useState } from 'react';
import { useStore } from '../store/gameStore';
import { SubredditPack } from '../types/supabase';
import { X, Search } from 'lucide-react';

interface SubredditPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (pack: SubredditPack) => void;
}

export const SubredditPackModal: React.FC<SubredditPackModalProps> = ({
  isOpen,
  onClose,
  onSelectPack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSubreddits, setLoadingSubreddits] = useState<Record<string, boolean>>({});
  const {
    availableSubreddits,
    subredditPacks,
    currentSubreddit,
    fetchAvailableSubreddits,
    fetchSubredditPacks,
  } = useStore();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSubreddits();
    }
  }, [isOpen, fetchAvailableSubreddits]);

  const filteredSubreddits = availableSubreddits.filter(subreddit =>
    subreddit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubredditClick = async (subreddit: string) => {
    try {
      if (!subredditPacks[subreddit] || 
          new Date(subredditPacks[subreddit].lastUpdated).getTime() < Date.now() - 3600000) {
        setLoadingSubreddits(prev => ({ ...prev, [subreddit]: true }));
        await fetchSubredditPacks(subreddit);
        setLoadingSubreddits(prev => ({ ...prev, [subreddit]: false }));
      }
    } catch (error) {
      console.error('Error loading subreddit pack:', error);
      setLoadingSubreddits(prev => ({ ...prev, [subreddit]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-gray-900 shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Subreddit Packs</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subreddits..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredSubreddits.map((subreddit) => (
          <button
            key={subreddit}
            onClick={() => handleSubredditClick(subreddit)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentSubreddit === subreddit
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="font-medium">r/{subreddit}</div>
            <div className="text-sm text-gray-400 mt-1">
              {loadingSubreddits[subreddit] ? (
                <span className="animate-pulse">Loading words...</span>
              ) : subredditPacks[subreddit] ? (
                `${subredditPacks[subreddit].words.length} word${subredditPacks[subreddit].words.length === 1 ? '' : 's'} available`
              ) : (
                <span className="animate-pulse">Click to load words</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
