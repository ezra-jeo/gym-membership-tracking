'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Mail, Phone, User } from 'lucide-react';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'standard',
  });

  // Mock members data
  const members = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      plan: 'Premium',
      status: 'active',
      joinDate: '2023-01-15',
      lastCheckin: '2024-02-24',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '(555) 234-5678',
      plan: 'Standard',
      status: 'active',
      joinDate: '2023-06-20',
      lastCheckin: '2024-02-23',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '(555) 345-6789',
      plan: 'Premium',
      status: 'active',
      joinDate: '2022-03-10',
      lastCheckin: '2024-02-24',
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '(555) 456-7890',
      plan: 'Standard',
      status: 'inactive',
      joinDate: '2023-11-05',
      lastCheckin: '2024-02-10',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@example.com',
      phone: '(555) 567-8901',
      plan: 'Basic',
      status: 'active',
      joinDate: '2024-01-20',
      lastCheckin: '2024-02-22',
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      phone: '(555) 678-9012',
      plan: 'Premium',
      status: 'active',
      joinDate: '2023-04-12',
      lastCheckin: '2024-02-24',
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      console.log('Adding member:', newMember);
      setNewMember({ name: '', email: '', phone: '', plan: 'standard' });
      setShowDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p 
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
          >
            Management
          </p>
          <h1 
            className="text-5xl font-bold mt-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Members
          </h1>
          <p 
            className="text-lg mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage your gym members and memberships
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
              <Plus size={20} />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Enter the member's details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="plan">Membership Plan</Label>
                <Select value={newMember.plan} onValueChange={(value) => setNewMember({ ...newMember, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - $29/month</SelectItem>
                    <SelectItem value="standard">Standard - $49/month</SelectItem>
                    <SelectItem value="premium">Premium - $79/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full bg-primary hover:bg-primary/90">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-4 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Mail size={16} />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={16} />
                      {member.phone}
                    </div>
                    <div>
                      Joined: {new Date(member.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 md:gap-1">
                <Badge variant="outline">{member.plan}</Badge>
                <p className="text-xs text-muted-foreground">
                  Last: {new Date(member.lastCheckin).toLocaleDateString()}
                </p>
                <Link href={`/dashboard/members/${member.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No members found</p>
        </Card>
      )}
    </div>
  );
}
