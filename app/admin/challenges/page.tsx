'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Target, Users, Calendar, Trash2 } from 'lucide-react';

interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  goalType: string;
  goalTarget: number;
  startDate: string;
  endDate: string;
  reward: string | null;
  participantCount: number;
  createdAt: string;
}

export default function AdminChallengesPage() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalTarget, setGoalTarget] = useState('10');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reward, setReward] = useState('');

  useEffect(() => {
    loadChallenges();
    // Default dates
    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  async function loadChallenges() {
    const supabase = createClient();
    const { data } = await supabase
      .from('challenges')
      .select('*, challenge_participants(member_id)')
      .order('created_at', { ascending: false });

    if (data) {
      setChallenges(
        data.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          goalType: c.goal_type,
          goalTarget: c.goal_target,
          startDate: c.start_date,
          endDate: c.end_date,
          reward: c.reward,
          participantCount: (c.challenge_participants as unknown as { member_id: string }[])?.length ?? 0,
          createdAt: c.created_at,
        }))
      );
    }
    setIsLoading(false);
  }

  async function createChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const supabase = createClient();
    const { error } = await supabase.from('challenges').insert({
      title,
      description,
      goal_type: 'visit_count',
      goal_target: parseInt(goalTarget, 10),
      start_date: startDate,
      end_date: endDate,
      reward: reward || null,
      created_by: profile.id,
    });

    if (error) {
      toast.error('Failed to create challenge');
      return;
    }

    toast.success('Challenge created!');
    setShowForm(false);
    setTitle('');
    setDescription('');
    setGoalTarget('10');
    setReward('');
    loadChallenges();
  }

  async function deleteChallenge(id: string) {
    const supabase = createClient();
    await supabase.from('challenge_participants').delete().eq('challenge_id', id);
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete challenge');
      return;
    }
    toast.success('Challenge deleted');
    loadChallenges();
  }

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg animate-pulse bg-muted-foreground/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-foreground">Gym Challenges</h2>
          <p className="text-sm text-muted-foreground">Create and manage challenges for members</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          <Plus size={16} />
          New Challenge
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">Create Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createChallenge} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. January Grind"
                  required
                  className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Hit the gym 20 times this month!"
                  required
                  className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Target Visits</label>
                  <Input
                    type="number"
                    min="1"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                    className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Reward (optional)</label>
                  <Input
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="e.g. Free protein shake"
                    className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                  Create
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Challenge list */}
      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No challenges yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((c) => {
            const isActive = c.endDate >= today;
            return (
              <Card key={c.id} className="border-muted-foreground/10 bg-muted-foreground/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-primary-foreground">{c.title}</p>
                      <Badge
                        variant="outline"
                        className={isActive ? 'border-emerald-500/30 text-emerald-400' : 'border-muted-foreground/30 text-muted-foreground'}
                      >
                        {isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target size={12} />
                        {c.goalTarget} visits
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {c.participantCount} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {c.startDate} — {c.endDate}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteChallenge(c.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
