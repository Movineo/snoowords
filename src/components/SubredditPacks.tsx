import React, { useEffect, useState } from 'react';
import { useStore } from '../store/gameStore';

const SubredditPacks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    availableSubreddits,
    subredditPacks,
    currentSubreddit,
    fetchAvailableSubreddits,
    fetchSubredditPacks,
    setShowSubredditPacks
  } = useStore();

  useEffect(() => {
    fetchAvailableSubreddits();
  }, [fetchAvailableSubreddits]);

  const filteredSubreddits = availableSubreddits.filter(subreddit =>
    subreddit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubredditClick = async (subreddit: string) => {
    try {
      if (!subredditPacks[subreddit] || 
          new Date(subredditPacks[subreddit].lastUpdated).getTime() < Date.now() - 3600000) {
        await fetchSubredditPacks(subreddit);
      }
    } catch (error) {
      console.error('Error loading subreddit pack:', error);
    }
  };

  return (
    <div className="absolute top-16 left-4 w-80 bg-white rounded-lg shadow-lg z-40 max-h-[80vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Subreddit Word Packs</h2>
          <button
            onClick={() => setShowSubredditPacks(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search subreddit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>

        <div className="space-y-1">
          {filteredSubreddits.length > 0 ? (
            filteredSubreddits.map(subreddit => (
              <button
                key={subreddit}
                onClick={() => handleSubredditClick(subreddit)}
                className={`block w-full text-left p-2 rounded-md hover:bg-gray-100 text-sm ${
                  currentSubreddit === subreddit ? 'bg-blue-100' : ''
                }`}
              >
                r/{subreddit}
              </button>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No subreddits found</div>
          )}
        </div>

        {currentSubreddit && subredditPacks[currentSubreddit] && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Words from r/{currentSubreddit}</h3>
            {subredditPacks[currentSubreddit].words.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {subredditPacks[currentSubreddit].words.map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    className="p-2 bg-gray-50 rounded-md text-sm"
                  >
                    {word}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                No words found in this pack
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubredditPacks;
