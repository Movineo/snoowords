import { supabase } from '../config/supabase';
import { Challenge } from '../types';
import { toast } from 'react-hot-toast';

interface ChallengeStats {
  participants: number;
  avgScore: number;
  topScores: { username: string; score: number }[];
}

class ChallengeService {
  public async getCurrentChallenge(): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error fetching current challenge:', error);
      return null;
    }

    return data;
  }

  public async getChallengeStats(challengeId: string): Promise<ChallengeStats | null> {
    try {
      // Get challenge participants and scores
      const { data: scores, error: scoresError } = await supabase
        .from('challenge_scores')
        .select('username, score')
        .eq('challenge_id', challengeId)
        .order('score', { ascending: false });

      if (scoresError) throw scoresError;

      // Calculate stats
      const participants = scores?.length || 0;
      const totalScore = scores?.reduce((sum, entry) => sum + entry.score, 0) || 0;
      const avgScore = participants > 0 ? Math.round(totalScore / participants) : 0;
      const topScores = (scores || []).slice(0, 3);

      return {
        participants,
        avgScore,
        topScores
      };
    } catch (error) {
      console.error('Error fetching challenge stats:', error);
      return null;
    }
  }

  public async submitScore(challengeId: string, username: string, score: number): Promise<boolean> {
    try {
      // Check if user already has a score for this challenge
      const { data: existingScore } = await supabase
        .from('challenge_scores')
        .select('score')
        .eq('challenge_id', challengeId)
        .eq('username', username)
        .single();

      // Only update if new score is higher
      if (existingScore && existingScore.score >= score) {
        toast('Your previous score was higher!', {
          icon: 'ℹ️',
          duration: 3000
        });
        return false;
      }

      // Upsert score
      const { error } = await supabase
        .from('challenge_scores')
        .upsert({
          challenge_id: challengeId,
          username,
          score,
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'challenge_id,username'
        });

      if (error) throw error;

      toast('Challenge score submitted!', {
        icon: '👍',
        duration: 3000
      });
      return true;
    } catch (error) {
      console.error('Error submitting challenge score:', error);
      toast('Failed to submit challenge score', {
        icon: '⚠️',
        duration: 3000
      });
      return false;
    }
  }
}

export const challengeService = new ChallengeService();
