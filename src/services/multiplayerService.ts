import { SupabaseClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/realtime-js';
import { supabase } from '../config/supabase';
import { useGameStore } from '../store/gameStore';
import { toast } from 'react-hot-toast';

interface GameRoom {
  id: string;
  host_id: string;
  guest_id?: string;
  status: 'waiting' | 'playing' | 'finished';
  word_pack_id?: string;
  created_at: string;
}

interface GameState {
  players: {
    [key: string]: {
      name: string;
      score: number;
      words: string[];
    }
  };
  gameStatus: 'waiting' | 'playing' | 'ended';
  remainingTime: number;
  winningPlayer?: string;
}

interface PresenceState {
  presence_ref: string;
  user_id: string;
  user_name: string;
  online_at: string;
}

interface MultiplayerGameState {
  roomId: string;
  players: {
    id: string;
    name: string;
    score: number;
    words: string[];
  }[];
  status: 'waiting' | 'playing' | 'ended';
  timeLeft: number;
  winner?: string;
}

type RealtimeResponse = 'ok' | 'timed out' | 'error' | 'closed';

class MultiplayerService {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private gameState: GameState | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private playerName: string | null = null;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    // Subscribe to presence events
    this.supabase
      .channel('game_rooms')
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .subscribe();
  }

  private handlePresenceSync() {
    if (this.channel) {
      const presenceState = this.channel.presenceState() as Record<string, PresenceState[]>;
      const connectedPlayers = Object.values(presenceState)
        .flat()
        .map(player => ({
          id: player.user_id,
          name: player.user_name,
          online_at: player.online_at,
          status: 'online' as const
        }));
      useGameStore.getState().setConnectedPlayers(connectedPlayers);
    }
  }

  public async createRoom(wordPackId?: string): Promise<string> {
    const currentUser = useGameStore.getState().redditUser;
    if (!currentUser?.name) throw new Error('User not logged in');

    const { data: room, error } = await this.supabase
      .from('game_rooms')
      .insert([
        {
          host_id: currentUser.name,
          status: 'waiting' as const,
          word_pack_id: wordPackId,
        },
      ])
      .select<'game_rooms', GameRoom>()
      .single();

    if (error || !room) {
      throw new Error(error?.message || 'Failed to create game room');
    }

    this.roomId = room.id;
    await this.joinRoom(room.id);
    return room.id;
  }

  public async joinRoom(roomId: string): Promise<{ success: boolean; error?: any }> {
    try {
      this.roomId = roomId;
      await this.subscribeToGameUpdates(roomId);
      return { success: true };
    } catch (error) {
      console.error('Error joining room:', error);
      return { success: false, error };
    }
  }

  private async subscribeToGameUpdates(roomId: string): Promise<{ success: boolean }> {
    const channel = this.supabase.channel(`game_rooms:${roomId}`);
    if (!channel) {
      throw new Error('Failed to create channel');
    }

    this.channel = channel;

    try {
      await this.channel
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('broadcast', { event: 'game_state' }, ({ payload }: { payload: GameState }) => {
          if (this.roomId) {
            this.handleGameUpdate(payload);
          }
        })
        .on('broadcast', { event: 'word_found' }, ({ payload }: { payload: { word: string; player: string } }) => {
          if (payload.player !== this.userId) {
            const store = useGameStore.getState();
            store.addOpponentWord(payload.word, payload.player);
            store.playWordFound(payload.word);
            store.incrementKarma(1);
          }
        })
        .on('broadcast', { event: 'game_over' }, ({ payload }: { payload: { winners: string[] } }) => {
          void this.handleGameOver(payload);
        })
        .subscribe();

      // Track presence with user info
      if (this.userId && this.playerName) {
        const response = await this.channel.track({
          user_id: this.userId,
          user_name: this.playerName,
          online_at: new Date().toISOString(),
        }) as RealtimeResponse;

        if (response === 'error' || response === 'timed out') {
          throw new Error(`Failed to track presence: ${response}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to subscribe to game updates:', error);
      throw error;
    }
  }

  public async startGame(): Promise<void> {
    if (!this.channel) {
      throw new Error('Not in a game room');
    }

    const gameState: GameState = {
      players: {},
      gameStatus: 'playing',
      remainingTime: 60,
    };

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'game_state',
        payload: gameState,
      });

      this.gameState = gameState;
      this.handleGameUpdate(gameState);
      this.startGameTimer();
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  private async startGameTimer() {
    if (!this.channel || !this.gameState) return;

    const timer = setInterval(() => {
      if (this.gameState) {
        this.gameState.remainingTime--;

        if (this.gameState.remainingTime <= 0) {
          clearInterval(timer);
          void this.endGame();
        } else {
          // Send game state update
          const response = this.channel?.send({
            type: 'broadcast',
            event: 'game_state',
            payload: this.gameState,
          }) as Promise<RealtimeResponse>;

          void response.then((status) => {
            if (status === 'error' || status === 'timed out') {
              console.error('Failed to update game state:', status);
              clearInterval(timer);
            }
          });
        }
      }
    }, 1000);
  }

  public async submitWord(word: string): Promise<void> {
    if (!this.channel || !this.userId) {
      throw new Error('Not in a game room or not authenticated');
    }

    const response = await this.channel.send({
      type: 'broadcast',
      event: 'word_found',
      payload: {
        word,
        player: this.userId
      }
    }) as RealtimeResponse;

    if (response === 'error' || response === 'timed out') {
      throw new Error(`Failed to submit word: ${response}`);
    }
  }

  private handleGameUpdate(payload: GameState) {
    if (!this.roomId) return;

    const multiplayerState: MultiplayerGameState = {
      roomId: this.roomId,
      players: Object.entries(payload.players).map(([id, player]) => ({
        id,
        name: player.name,
        score: player.score,
        words: player.words
      })),
      status: payload.gameStatus,
      timeLeft: payload.remainingTime,
      winner: payload.winningPlayer
    };
    useGameStore.getState().updateMultiplayerState(multiplayerState);
  }

  private handleGameOver(payload: { winners: string[] }) {
    if (!this.channel) return;

    const isWinner = this.userId && payload.winners.includes(this.userId);

    if (isWinner) {
      toast.success('Congratulations! You won! 🎉');
      useGameStore.getState().incrementKarma(10);
    } else {
      toast('Game Over! Better luck next time! 🎮');
    }

    // Update game state
    if (this.gameState) {
      this.gameState.gameStatus = 'ended';
      this.gameState.winningPlayer = payload.winners[0];
      this.handleGameUpdate(this.gameState);
    }

    // Clean up
    this.channel.unsubscribe();
    this.channel = null;
    this.gameState = null;
    this.roomId = null;
  }

  private async endGame() {
    if (!this.channel || !this.gameState) return;

    const players = Object.entries(this.gameState.players);
    const maxScore = Math.max(...players.map(([_, p]) => p.score));
    const winners = players
      .filter(([_, p]) => p.score === maxScore)
      .map(([id, _]) => id);

    // Send game over event
    const response = await this.channel.send({
      type: 'broadcast',
      event: 'game_over',
      payload: { winners },
    }) as RealtimeResponse;

    if (response === 'error' || response === 'timed out') {
      console.error('Failed to send game over event:', response);
    }

    // Check if current user is winner
    const isWinner = this.userId && winners.includes(this.userId);
    if (isWinner) {
      toast.success('Congratulations! You won! 🎉');
      useGameStore.getState().incrementKarma(10);
    } else {
      toast('Game Over! Better luck next time! 🎮');
    }

    // Update game state
    this.gameState.gameStatus = 'ended';
    this.gameState.winningPlayer = winners[0];
    this.handleGameUpdate(this.gameState);

    // Clean up
    await this.channel.unsubscribe();
    this.channel = null;
    this.gameState = null;
    this.roomId = null;
  }

  public async leaveRoom(): Promise<void> {
    if (this.channel) {
      const response = await this.channel.unsubscribe() as RealtimeResponse;
      if (response === 'error' || response === 'timed out') {
        console.error('Failed to unsubscribe from channel:', response);
      }
      this.channel = null;
    }
    this.gameState = null;
    this.roomId = null;
  }

  public getPlayerName(): string | null {
    return this.playerName;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public isInRoom(): boolean {
    return this.roomId !== null;
  }

  public getCurrentRoomId(): string | null {
    return this.roomId;
  }
}

export const multiplayerService = new MultiplayerService(supabase);
