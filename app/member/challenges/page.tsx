'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { Challenge, ChallengeParticipant } from '@/lib/types';
import { Target, Calendar, Users, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<(Challenge & { participantCount: number; myProgress: ChallengeParticipant | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!profile) return;
    loadChallenges();
  }, [profile]);

  async function loadChallenges() {
    if (!profile) return;
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: challengeData } = await supabase
      .from('challenges')
      .select('*, challenge_participants(member_id, progress, completed)')
      .order('start_date', { ascending: false });

    if (challengeData) {
      const mapped = challengeData.map((c) => {
        const participants = c.challenge_participants as unknown as { member_id: string; progress: number; completed: boolean }[];
        const myParticipation = participants?.find((p) => p.member_id === profile.id);

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          goalType: c.goal_type,
          goalTarget: c.goal_target,
          startDate: c.start_date,
          endDate: c.end_date,
          reward: c.reward,
          createdBy: c.created_by,
          createdAt: c.created_at,
          participantCount: participants?.length ?? 0,
          myProgress: myParticipation ? {
            challengeId: c.id,
            memberId: profile.id,
            progress: myParticipation.progress,
            completed: myParticipation.completed,
            joinedAt: '',
          } : null,
        };
      });

      setChallenges(mapped);
    }
    setIsLoading(false);
  }

  async function joinChallenge(challengeId: string) {
    if (!profile) return;
    const supabase = createClient();

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id: challengeId,
      member_id: profile.id,
    });

    if (error) {
      toast.error('Failed to join challenge');
      return;
    }

    toast.success('Joined challenge!');
    loadChallenges();
  }

  const today = new Date().toISOString().split('T')[0];
  const activeChallenges = challenges.filter((c) => c.endDate >= today);
  const completedChallenges = challenges.filter((c) => c.endDate < today);
  const displayChallenges = filter === 'active' ? activeChallenges : completedChallenges;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Challenges
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Join challenges and push your limits
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('active')}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={{
            backgroundColor: filter === 'active' ? 'var(--color-primary)' : 'var(--color-white)',
            color: filter === 'active' ? 'var(--color-white)' : 'var(--color-text-secondary)',
            border: `1px solid ${filter === 'active' ? 'var(--color-primary)' : 'var(--color-surface)'}`,
          }}
        >
          Active ({activeChallenges.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
          style={{
            backgroundColor: filter === 'completed' ? 'var(--color-primary)' : 'var(--color-white)',
            color: filter === 'completed' ? 'var(--color-white)' : 'var(--color-text-secondary)',
            border: `1px solid ${filter === 'completed' ? 'var(--color-primary)' : 'var(--color-surface)'}`,
          }}
        >
          Past ({completedChallenges.length})
        </button>
      </div>

      {displayChallenges.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {filter === 'active' ? 'No active challenges' : 'No past challenges'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {filter === 'active' ? 'Check back soon for new challenges!' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={joinChallenge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  onJoin,
}: {
  challenge: Challenge & { participantCount: number; myProgress: ChallengeParticipant | null };
  onJoin: (id: string) => void;
}) {
  const isJoined = challenge.myProgress !== null;
  const progress = challenge.myProgress?.progress ?? 0;
  const progressPct = Math.min((progress / challenge.goalTarget) * 100, 100);
  const isCompleted = challenge.myProgress?.completed ?? false;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: 'var(--color-white)',
        borderColor: isCompleted ? 'var(--color-success)' : 'var(--color-surface)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {challenge.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {challenge.description}
          </p>
        </div>
        {isCompleted && (
          <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
        )}
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {challenge.participantCount} joined
        </span>
        <span className="flex items-center gap-1">
          <Target size={12} />
          {challenge.goalTarget} {challenge.goalType === 'visit_count' ? 'visits' : challenge.goalType}
        </span>
      </div>

      {/* Progress bar (if joined) */}
      {isJoined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {progress} / {challenge.goalTarget}
            </span>
            <span style={{ color: 'var(--color-primary)' }}>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
                width: `${progressPct}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Reward */}
      {challenge.reward && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-primary)' }}>
          🎁 Reward: {challenge.reward}
        </p>
      )}

      {/* Join button */}
      {!isJoined && daysLeft > 0 && (
        <button
          onClick={() => onJoin(challenge.id)}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          Join Challenge
        </button>
      )}
    </div>
  );
}
