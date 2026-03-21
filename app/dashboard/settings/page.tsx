'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, Bell, Lock, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [gymSettings, setGymSettings] = useState({
    name: 'Elite Fitness Center',
    email: 'contact@elitefitness.com',
    phone: '(555) 123-4567',
    address: '123 Fitness Ave, Sports City, SC 12345',
    timezone: 'UTC-5',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    membershipReminders: true,
    classReminders: true,
  });

  const [billingSettings, setBillingSettings] = useState({
    paymentMethod: 'stripe',
    invoiceEmail: 'billing@elitefitness.com',
  });

  const handleGymSettingsChange = (field: string, value: string) => {
    setGymSettings({ ...gymSettings, [field]: value });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p 
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-primary)' }}
        >
          Configuration
        </p>
        <h1 
          className="text-5xl font-bold mt-2"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}
        >
          Settings
        </h1>
        <p 
          className="text-lg mt-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Manage gym settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Building2 size={16} />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard size={16} />
            <span className="hidden md:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={16} />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Gym Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gym-name">Gym Name</Label>
                  <Input
                    id="gym-name"
                    value={gymSettings.name}
                    onChange={(e) => handleGymSettingsChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gym-email">Email</Label>
                  <Input
                    id="gym-email"
                    type="email"
                    value={gymSettings.email}
                    onChange={(e) => handleGymSettingsChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gym-phone">Phone</Label>
                  <Input
                    id="gym-phone"
                    value={gymSettings.phone}
                    onChange={(e) => handleGymSettingsChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gym-address">Address</Label>
                  <Input
                    id="gym-address"
                    value={gymSettings.address}
                    onChange={(e) => handleGymSettingsChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={gymSettings.timezone} onValueChange={(value) => handleGymSettingsChange('timezone', value)}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific (UTC-8)</SelectItem>
                      <SelectItem value="UTC-7">Mountain (UTC-7)</SelectItem>
                      <SelectItem value="UTC-6">Central (UTC-6)</SelectItem>
                      <SelectItem value="UTC-5">Eastern (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Membership Plans</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Basic Plan</p>
                    <p className="text-sm text-muted-foreground">$29/month</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Standard Plan</p>
                    <p className="text-sm text-muted-foreground">$49/month</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Premium Plan</p>
                    <p className="text-sm text-muted-foreground">$79/month</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition">
                  <div>
                    <Label className="text-foreground cursor-pointer">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition">
                  <div>
                    <Label className="text-foreground cursor-pointer">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(value) => handleNotificationChange('smsNotifications', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition">
                  <div>
                    <Label className="text-foreground cursor-pointer">Membership Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notify about membership expirations</p>
                  </div>
                  <Switch
                    checked={notificationSettings.membershipReminders}
                    onCheckedChange={(value) => handleNotificationChange('membershipReminders', value)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition">
                  <div>
                    <Label className="text-foreground cursor-pointer">Class Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notify about upcoming classes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.classReminders}
                    onCheckedChange={(value) => handleNotificationChange('classReminders', value)}
                  />
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Billing Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={billingSettings.paymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoice-email">Invoice Email</Label>
                  <Input
                    id="invoice-email"
                    type="email"
                    value={billingSettings.invoiceEmail}
                    onChange={(e) => setBillingSettings({ ...billingSettings, invoiceEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Monthly Subscription</p>
                    <p className="text-sm text-muted-foreground">Feb 1, 2024</p>
                  </div>
                  <p className="font-semibold text-foreground">$299.00</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Monthly Subscription</p>
                    <p className="text-sm text-muted-foreground">Jan 1, 2024</p>
                  </div>
                  <p className="font-semibold text-foreground">$299.00</p>
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90">Update Billing</Button>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Password</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button className="mt-4 bg-primary hover:bg-primary/90">Update Password</Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Current Session</p>
                    <p className="text-sm text-muted-foreground">Chrome on macOS</p>
                  </div>
                  <p className="text-xs text-green-600">Active</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
