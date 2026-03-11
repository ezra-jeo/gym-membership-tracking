'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Megaphone, Trash2 } from 'lucide-react';

interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    const supabase = createClient();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAnnouncements(
        data.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          createdAt: a.created_at,
        }))
      );
    }
    setIsLoading(false);
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const supabase = createClient();

    // Create announcement
    const { error } = await supabase.from('announcements').insert({
      title,
      body,
      created_by: profile.id,
    });

    if (error) {
      toast.error('Failed to create announcement');
      return;
    }

    // Also post to feed
    await supabase.from('feed_items').insert({
      member_id: profile.id,
      type: 'announcement' as const,
      title: `📢 ${title}`,
      description: body,
    });

    toast.success('Announcement posted!');
    setShowForm(false);
    setTitle('');
    setBody('');
    loadAnnouncements();
  }

  async function deleteAnnouncement(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
      return;
    }
    toast.success('Announcement deleted');
    loadAnnouncements();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg animate-pulse bg-muted-foreground/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">Broadcast messages to all members</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          <Plus size={16} />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAnnouncement} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Holiday Hours"
                  required
                  className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Message</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your announcement..."
                  required
                  rows={4}
                  className="mt-1 border-muted-foreground/20 bg-foreground text-primary-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                  Post Announcement
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="border-muted-foreground/10 bg-muted-foreground/5">
              <CardContent className="flex items-start justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium text-primary-foreground">{a.title}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAnnouncement(a.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
