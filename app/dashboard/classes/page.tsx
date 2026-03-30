'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Users, Clock, MapPin } from 'lucide-react';

export default function ClassesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [newClass, setNewClass] = useState({
    name: '',
    instructor: '',
    time: '',
    capacity: '',
  });

  // Mock classes data
  const classes = [
    {
      id: 1,
      name: 'HIIT Training',
      instructor: 'Alex Johnson',
      time: '6:00 AM',
      day: 'Monday',
      capacity: 20,
      enrolled: 18,
      room: 'Studio A',
      level: 'Advanced',
    },
    {
      id: 2,
      name: 'Yoga Flow',
      instructor: 'Sarah Lee',
      time: '8:00 AM',
      day: 'Monday',
      capacity: 15,
      enrolled: 12,
      room: 'Studio B',
      level: 'Beginner',
    },
    {
      id: 3,
      name: 'Spinning',
      instructor: 'Mike Williams',
      time: '6:30 PM',
      day: 'Monday',
      capacity: 25,
      enrolled: 23,
      room: 'Cycling Studio',
      level: 'Intermediate',
    },
    {
      id: 4,
      name: 'Strength & Power',
      instructor: 'Lisa Chen',
      time: '7:00 AM',
      day: 'Wednesday',
      capacity: 20,
      enrolled: 19,
      room: 'Studio A',
      level: 'Intermediate',
    },
    {
      id: 5,
      name: 'Pilates',
      instructor: 'Emma Davis',
      time: '10:00 AM',
      day: 'Wednesday',
      capacity: 12,
      enrolled: 8,
      room: 'Studio B',
      level: 'Beginner',
    },
    {
      id: 6,
      name: 'Boxing',
      instructor: 'James Rodriguez',
      time: '5:30 PM',
      day: 'Friday',
      capacity: 20,
      enrolled: 20,
      room: 'Boxing Ring',
      level: 'Intermediate',
    },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredClasses = classes.filter((cls) => cls.day === selectedDay);

  const handleAddClass = () => {
    if (newClass.name && newClass.instructor) {
      console.log('Adding class:', newClass);
      setNewClass({ name: '', instructor: '', time: '', capacity: '' });
      setShowDialog(false);
    }
  };

  const getCapacityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'bg-red-100 dark:bg-red-900/30 border-red-200';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200';
    return 'bg-green-100 dark:bg-green-900/30 border-green-200';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
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
            Programming
          </p>
          <h1 
            className="text-5xl font-bold mt-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Classes
          </h1>
          <p 
            className="text-lg mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage group classes and schedules
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
              <Plus size={20} />
              Schedule Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Class</DialogTitle>
              <DialogDescription>Add a new class to the schedule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g., Zumba"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newClass.instructor}
                  onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newClass.time}
                  onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                  placeholder="20"
                />
              </div>
              <Button onClick={handleAddClass} className="w-full bg-primary hover:bg-primary/90">
                Create Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className={selectedDay === day ? 'bg-primary hover:bg-primary/90' : ''}
          >
            {day.slice(0, 3)}
          </Button>
        ))}
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <Card key={cls.id} className={`p-4 ${getCapacityColor(cls.enrolled, cls.capacity)}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{cls.name}</h3>
                    <Badge className={getLevelColor(cls.level)}>{cls.level}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      {cls.instructor}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {cls.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {cls.room}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Enrollment</span>
                      <span className="text-xs font-medium">
                        {cls.enrolled}/{cls.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition"
                        style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                      />
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
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
          </Card>
        )}
      </div>

      {/* Class Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Class Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Classes</p>
            <p className="text-2xl font-bold text-foreground mt-2">{classes.length}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Enrollment</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {classes.reduce((sum, cls) => sum + cls.enrolled, 0)}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Avg. Enrollment</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {Math.round(classes.reduce((sum, cls) => sum + cls.enrolled, 0) / classes.length)}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
