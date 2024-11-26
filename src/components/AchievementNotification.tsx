import React, { useEffect, useState } from 'react';
import { Achievement } from '../services/achievementService';
import { animationService } from '../services/animationService';
import { voiceService } from '../services/voiceService';

interface AchievementNotificationProps {
  achievement: Achievement;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Play achievement sound
    animationService.playSound('levelUp');
    voiceService.speak(`Achievement unlocked: ${achievement.title}`);

    // Remove after delay
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [achievement]);

  return (
    <div
      className={`fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 transform transition-transform duration-500 z-50 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="text-4xl">{achievement.icon}</div>
      <div>
        <h3 className="font-bold text-gray-800">{achievement.title}</h3>
        <p className="text-sm text-gray-600">{achievement.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-500">+{achievement.points}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              achievement.rarity === 'legendary'
                ? 'bg-purple-100 text-purple-800'
                : achievement.rarity === 'epic'
                ? 'bg-yellow-100 text-yellow-800'
                : achievement.rarity === 'rare'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {achievement.rarity}
          </span>
        </div>
      </div>
    </div>
  );
};
