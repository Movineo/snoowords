import React from 'react';
import toast from 'react-hot-toast';

export const showAchievementToast = (name: string) => {
  toast.success(`Achievement Unlocked: ${name}`, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#1a1a1a',
      color: '#ffffff',
      border: '1px solid #2d2d2d',
      padding: '16px',
      borderRadius: '8px',
    },
    icon: '🏆',
  });
};
