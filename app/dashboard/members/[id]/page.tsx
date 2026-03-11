'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Mail, Phone, User, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id;

  // Mock member data
  const member = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    plan: 'Premium',
    status: 'active',
    joinDate: '2023-01-15',
    planExpiry: '2025-01-15',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  };

  // Attendance data
  const attendanceData = [
    { week: 'Week 1', checkins: 5 },
    { week: 'Week 2', checkins: 7 },
    { week: 'Week 3', checkins: 6 },
    { week: 'Week 4', checkins: 8 },
  ];

  // Recent checkins
  const recentCheckins = [
    { date: '2024-02-24', time: '6:30 AM', duration: '1h 30m' },
    { date: '2024-02-23', time: '5:15 PM', duration: '1h 45m' },
    { date: '2024-02-22', time: '7:00 AM', duration: '1h 15m' },
    { date: '2024-02-20', time: '6:45 PM', duration: '2h' },
    { date: '2024-02-19', time: '6:30 AM', duration: '1h 30m' },
  ];

  // Classes enrolled
  const enrolledClasses = [
    { name: 'HIIT Training', schedule: 'Mon, Wed, Fri - 6:00 AM', instructor: 'Alex Johnson' },
    { name: 'Yoga Flow', schedule: 'Tue, Thu - 8:00 AM', instructor: 'Sarah Lee' },
    { name: 'Spinning', schedule: 'Sat - 9:00 AM', instructor: 'Mike Williams' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/members">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={20} />
          Back to Members
        </Button>
      </Link>

      {/* Member Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="text-primary w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{member.name}</h1>
              <p className="text-muted-foreground mt-1">{member.plan} Member</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Message</Button>
            <Button className="bg-primary hover:bg-primary/90">Edit Member</Button>
          </div>
        </div>
      </Card>

      {/* Member Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="text-primary w-5 h-5" />
            <p className="text-sm text-muted-foreground">Email</p>
          </div>
          <p className="font-semibold text-foreground">{member.email}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="text-primary w-5 h-5" />
            <p className="text-sm text-muted-foreground">Phone</p>
          </div>
          <p className="font-semibold text-foreground">{member.phone}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-primary w-5 h-5" />
            <p className="text-sm text-muted-foreground">Member Since</p>
          </div>
          <p className="font-semibold text-foreground">
            {new Date(member.joinDate).toLocaleDateString()}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-primary w-5 h-5" />
            <p className="text-sm text-muted-foreground">Plan Expires</p>
          </div>
          <p className="font-semibold text-foreground">
            {new Date(member.planExpiry).toLocaleDateString()}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line type="monotone" dataKey="checkins" stroke="var(--primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground mt-2">26</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+3 from last month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average/Week</p>
                <p className="text-2xl font-bold text-foreground mt-2">6.5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground mt-2">12 days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold text-foreground mt-2">156</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          {enrolledClasses.map((cls, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{cls.name}</h4>
                  <p className="text-sm text-muted-foreground">{cls.schedule}</p>
                  <p className="text-sm text-muted-foreground mt-1">Instructor: {cls.instructor}</p>
                </div>
                <Button variant="outline" size="sm">
                  Drop Class
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Check-ins</h3>
            <div className="space-y-3">
              {recentCheckins.map((checkin, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition">
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(checkin.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{checkin.time}</p>
                  </div>
                  <p className="font-semibold text-foreground">{checkin.duration}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-foreground mb-4">Member Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="gap-2">
            Renew Membership
          </Button>
          <Button variant="outline" className="gap-2">
            Send Message
          </Button>
          <Button variant="destructive" className="gap-2">
            Cancel Membership
          </Button>
        </div>
      </Card>
    </div>
  );
}
