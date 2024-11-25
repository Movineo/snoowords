import React from 'react';
import { Trophy, Users, Calendar } from 'lucide-react';
import { Challenge } from '../types';
import { format } from 'date-fns';

interface ChallengesProps {
  challenges: Challenge[];
  onJoinChallenge: (challenge: Challenge) => void;
}

export const Challenges: React.FC<ChallengesProps> = ({
  challenges,
  onJoinChallenge,
}) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <Trophy className="w-6 h-6" />
      Active Challenges
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-4"
        >
          <h3 className="text-lg font-bold mb-2">{challenge.title}</h3>
          <p className="text-sm text-purple-200 mb-3">
            {challenge.description}
          </p>
          <div className="space-y-2 text-sm text-purple-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(challenge.startDate), 'MMM d')} -{' '}
                {format(new Date(challenge.endDate), 'MMM d')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{challenge.participants} participants</span>
            </div>
          </div>
          <button
            onClick={() => onJoinChallenge(challenge)}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Join Challenge
          </button>
        </div>
      ))}
    </div>
  </div>
);