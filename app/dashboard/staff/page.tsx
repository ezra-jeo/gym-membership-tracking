'use client';

import { useState } from 'react';
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
import { Plus, Search, Mail, Phone, User, Edit2, Trash2 } from 'lucide-react';

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    department: 'general',
  });

  // Mock staff data
  const staff = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@stren.com',
      phone: '(555) 111-1111',
      role: 'admin',
      department: 'Management',
      status: 'active',
      joinDate: '2022-01-10',
      permissions: ['Full Access'],
    },
    {
      id: 2,
      name: 'Alex Johnson',
      email: 'alex@stren.com',
      phone: '(555) 222-2222',
      role: 'staff',
      department: 'Front Desk',
      status: 'active',
      joinDate: '2023-03-15',
      permissions: ['Check-in/out', 'Member management'],
    },
    {
      id: 3,
      name: 'Sarah Williams',
      email: 'sarah@stren.com',
      phone: '(555) 333-3333',
      role: 'trainer',
      department: 'Training',
      status: 'active',
      joinDate: '2023-06-20',
      permissions: ['Class management', 'Member profiles'],
    },
    {
      id: 4,
      name: 'Mike Chen',
      email: 'mike@stren.com',
      phone: '(555) 444-4444',
      role: 'staff',
      department: 'Maintenance',
      status: 'inactive',
      joinDate: '2022-11-05',
      permissions: ['Facility access'],
    },
    {
      id: 5,
      name: 'Emma Brown',
      email: 'emma@stren.com',
      phone: '(555) 555-5555',
      role: 'trainer',
      department: 'Training',
      status: 'active',
      joinDate: '2023-08-12',
      permissions: ['Class management', 'Member profiles', 'Nutrition plans'],
    },
  ];

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email) {
      console.log('Adding staff:', newStaff);
      setNewStaff({ name: '', email: '', phone: '', role: 'staff', department: 'general' });
      setShowDialog(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'trainer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default:
        return '';
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
            Team
          </p>
          <h1 
            className="text-5xl font-bold mt-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Staff Management
          </h1>
          <p 
            className="text-lg mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage team members and permissions
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
              <Plus size={20} />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>Invite a new team member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="john@stren.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newStaff.department} onValueChange={(value) => setNewStaff({ ...newStaff, department: value })}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="front-desk">Front Desk</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddStaff} className="w-full bg-primary hover:bg-primary/90">
                Add Staff Member
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
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="trainer">Trainer</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff List */}
      <div className="grid gap-4">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="p-4 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="text-primary w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
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
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((perm, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 md:flex-col">
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit2 size={16} />
                  <span className="hidden md:inline">Edit</span>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No staff members found</p>
        </Card>
      )}

      {/* Role Permissions Info */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-foreground mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-foreground mb-2">Admin</p>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Full system access</li>
              <li>• Manage staff</li>
              <li>• View all reports</li>
              <li>• Settings access</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">Trainer</p>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Manage classes</li>
              <li>• View member profiles</li>
              <li>• Create training plans</li>
              <li>• View attendance</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">Staff</p>
            <ul className="text-sm text-foreground space-y-1">
              <li>• Check-in/out members</li>
              <li>• View member info</li>
              <li>• Front desk tasks</li>
              <li>• Limited reports</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
