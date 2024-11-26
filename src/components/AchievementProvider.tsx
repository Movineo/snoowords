import React, { useEffect, useState } from 'react';
import { Achievement } from '../services/achievementService';
import { AchievementNotification } from './AchievementNotification';

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(
    null
  );

  useEffect(() => {
    const handleAchievementUnlock = (event: CustomEvent<{ achievement: Achievement }>) => {
      setCurrentAchievement(event.detail.achievement);
    };

    window.addEventListener(
      'achievement-unlocked',
      handleAchievementUnlock as EventListener
    );

    return () => {
      window.removeEventListener(
        'achievement-unlocked',
        handleAchievementUnlock as EventListener
      );
    };
  }, []);

  return (
    <>
      {children}
      {currentAchievement && (
        <AchievementNotification achievement={currentAchievement} />
      )}
    </>
  );
};
