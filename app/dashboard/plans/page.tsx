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
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

export default function PlansPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    duration: '1',
    features: '',
  });

  // Mock plans data
  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 29,
      duration: 'month',
      description: 'Perfect for beginners',
      members: 45,
      features: ['Gym access', 'Locker room', 'Basic equipment', 'Email support'],
      isPopular: false,
    },
    {
      id: 2,
      name: 'Standard',
      price: 49,
      duration: 'month',
      description: 'Most popular plan',
      members: 120,
      features: ['Everything in Basic', 'Group classes', 'Personal locker', 'Priority support', 'Guest pass (1/month)'],
      isPopular: true,
    },
    {
      id: 3,
      name: 'Premium',
      price: 79,
      duration: 'month',
      description: 'Full access plan',
      members: 83,
      features: ['Everything in Standard', 'Personal training', '24/7 access', 'Priority booking', 'Guest pass (4/month)', 'Nutrition coaching'],
      isPopular: false,
    },
  ];

  const handleAddPlan = () => {
    if (newPlan.name && newPlan.price) {
      console.log('Adding plan:', newPlan);
      setNewPlan({ name: '', price: '', duration: '1', features: '' });
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
            Monetization
          </p>
          <h1 
            className="text-5xl font-bold mt-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Membership Plans
          </h1>
          <p 
            className="text-lg mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage membership packages and pricing
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 md:w-auto w-full">
              <Plus size={20} />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>Add a new membership plan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="Premium Plus"
                />
              </div>
              <div>
                <Label htmlFor="plan-price">Price ($)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  placeholder="99"
                />
              </div>
              <div>
                <Label htmlFor="plan-duration">Billing Period (months)</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="plan-features">Features (comma separated)</Label>
                <Input
                  id="plan-features"
                  value={newPlan.features}
                  onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                  placeholder="Gym access, Personal training, 24/7 access"
                />
              </div>
              <Button onClick={handleAddPlan} className="w-full bg-primary hover:bg-primary/90">
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 transition ${
              plan.isPopular ? 'ring-2 ring-primary shadow-lg scale-105 md:scale-100' : ''
            }`}
          >
            {plan.isPopular && (
              <Badge className="absolute -top-3 left-4 bg-primary">Popular</Badge>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.duration === '1' ? 'month' : plan.duration + ' months'}</span>
            </div>

            <div className="mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground">
                <strong>{plan.members}</strong> members
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setEditingPlan(plan.id)}
              >
                <Edit2 size={16} />
                Edit
              </Button>
              <Button variant="destructive" size="icon">
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Analytics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Plan Revenue (Monthly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const revenue = plan.members * plan.price;
            return (
              <div key={plan.id} className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <p className="text-2xl font-bold text-foreground mt-2">${revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{plan.members} members</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Plan Management Rules */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-foreground mb-3">Plan Management Rules</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Can't delete plans with active members - archive them instead</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Price changes apply to new signups only</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Existing members keep their current pricing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Promo codes can override plan pricing</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
