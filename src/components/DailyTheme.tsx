import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { themeService, DailyTheme as DailyThemeType } from '../services/themeService';
import { toast } from 'react-hot-toast';

export const DailyTheme = () => {
  const [theme, setTheme] = useState<DailyThemeType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const dailyTheme = await themeService.getDailyTheme();
        setTheme(dailyTheme);
      } catch (error) {
        console.error('Failed to load daily theme:', error);
        toast.error('Failed to load daily theme');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 mb-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!theme) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Daily Theme: {theme.theme}</span>
        </div>
        <p className="text-sm text-purple-200 mt-1">
          {theme.description}
        </p>
        <div className="mt-3">
          <div className="text-sm font-medium text-purple-300 mb-2">Bonus Words (2x points):</div>
          <div className="flex flex-wrap gap-2">
            {theme.bonus_words.map((word, index) => (
              <span
                key={index}
                className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};