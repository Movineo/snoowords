import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Clock, Share2 } from 'lucide-react';
import { useStore } from '../store/gameStore';
import { multiplayerService } from '../services/multiplayerService';
import { CommunityChallenge } from './CommunityChallenge';
import { toast } from 'react-hot-toast';

export const MultiplayerGame: React.FC = () => {
  const {
    redditUser,
    gameState,
    words,
    score,
    connectedPlayers,
    selectedWordPack,
  } = useStore();

  const [roomCode, setRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      multiplayerService.leaveRoom();
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      const roomId = await multiplayerService.createRoom(selectedWordPack?.id);
      setRoomCode(roomId);
      setShowInvite(true);
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      toast.error('Please enter a room code');
      return;
    }

    try {
      setIsJoining(true);
      await multiplayerService.joinRoom(roomCode);
    } catch (error) {
      toast.error('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(
      `Join my SnooWords game! Room code: ${roomCode}`
    );
    toast.success('Invite copied to clipboard!');
  };

  const handleStartGame = async () => {
    try {
      await multiplayerService.startGame();
    } catch (error) {
      toast.error('Failed to start game');
    }
  };

  if (!redditUser) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">Sign in with Reddit</h2>
        <p className="text-gray-400 mb-4">
          You need to sign in with Reddit to play multiplayer games.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Multiplayer Mode
          </h2>
          {gameState && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-mono text-xl">
                  {gameState.timeRemaining}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-mono text-xl">{score}</span>
              </div>
            </div>
          )}
        </div>

        {!gameState ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Create Game</h3>
                <button
                  onClick={handleCreateRoom}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                >
                  Create Room
                </button>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Join Game</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter room code"
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showInvite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-700 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">Invite Players</h3>
                      <p className="text-gray-400">
                        Share this room code with your friends:
                      </p>
                      <p className="font-mono text-xl mt-2">{roomCode}</p>
                    </div>
                    <button
                      onClick={handleCopyInvite}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                    >
                      <Share2 className="w-4 h-4" />
                      Copy Invite
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {connectedPlayers.length > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Connected Players</h3>
                <div className="space-y-2">
                  {connectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-gray-600 p-2 rounded"
                    >
                      <span>{player.name}</span>
                      {player.id === redditUser.name && (
                        <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {connectedPlayers.length >= 2 && (
                  <button
                    onClick={handleStartGame}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Start Game
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Your Words</h3>
                <div className="space-y-2">
                  {words.map((word) => (
                    <div
                      key={word.word}
                      className="bg-gray-600 p-2 rounded flex items-center justify-between"
                    >
                      <span>{word.word}</span>
                      <span className="text-gray-400">+{word.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Opponent's Words</h3>
                <div className="space-y-2">
                  {gameState.players
                    .filter((p) => p.id !== redditUser.name)
                    .flatMap((p) =>
                      p.words.map((word) => (
                        <div
                          key={`${p.id}-${word}`}
                          className="bg-gray-600 p-2 rounded flex items-center justify-between"
                        >
                          <span>{word}</span>
                          <span className="text-sm text-gray-400">{p.name}</span>
                        </div>
                      ))
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {!gameState && <CommunityChallenge />}
    </div>
  );
};
