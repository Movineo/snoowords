import { Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '../store/gameStore';

export const DailyTheme = () => {
  const { dailyTheme } = useStore();
  const trendingSubreddits = ['r/gaming', 'r/science', 'r/movies'];

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Daily Theme: {dailyTheme}</span>
        </div>
        <p className="text-sm text-purple-200 mt-1">
          Create theme-related words for 2x karma points!
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-lg font-semibold mb-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <span>Trending Subreddits</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingSubreddits.map(sub => (
            <span key={sub} className="bg-white/10 px-3 py-1 rounded-full text-sm">
              {sub}
            </span>
          ))}
        </div>
        <p className="text-sm text-orange-200 mt-2">
          Use words from trending topics for bonus karma!
        </p>
      </div>
    </div>
  );
};