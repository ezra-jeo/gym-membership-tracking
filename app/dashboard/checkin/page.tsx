'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export default function CheckinPage() {
  const [activeTab, setActiveTab] = useState('scan');
  const [manualId, setManualId] = useState('');
  const [lastCheckin, setLastCheckin] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Simulated member data for QR codes
  const memberData: { [key: string]: any } = {
    'MEMBER-001': {
      id: 'MEMBER-001',
      name: 'John Doe',
      plan: 'Premium',
      status: 'active',
    },
    'MEMBER-002': {
      id: 'MEMBER-002',
      name: 'Sarah Smith',
      plan: 'Standard',
      status: 'active',
    },
    'MEMBER-003': {
      id: 'MEMBER-003',
      name: 'Mike Johnson',
      plan: 'Premium',
      status: 'active',
    },
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      setMessage('Unable to access camera');
      setMessageType('error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const processCheckin = (memberId: string) => {
    const member = memberData[memberId];
    if (member) {
      const timestamp = new Date();
      setLastCheckin({
        ...member,
        timestamp,
        type: lastCheckin?.memberId === memberId ? 'checkout' : 'checkin',
      });
      setMessage(`${member.name} ${lastCheckin?.memberId === memberId ? 'checked out' : 'checked in'} successfully!`);
      setMessageType('success');
      setManualId('');
    } else {
      setMessage('Member not found');
      setMessageType('error');
    }
  };

  const handleManualCheckin = () => {
    if (manualId) {
      processCheckin(manualId);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p 
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-primary)' }}
        >
          Attendance
        </p>
        <h1 
          className="text-5xl font-bold mt-2"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}
        >
          Check-In
        </h1>
        <p 
          className="text-lg mt-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Member check-in and check-out
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Card className={`p-4 flex items-center gap-3 ${
          messageType === 'success' ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'bg-red-50 dark:bg-red-950 border-red-200'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="text-green-600 w-5 h-5" />
          ) : (
            <AlertCircle className="text-red-600 w-5 h-5" />
          )}
          <p className={messageType === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
            {message}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkin Interface */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="scan">QR Scanner</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {!isCameraActive ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Click to start camera</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )} 
                </div>
                <div className="flex gap-2">
                  {!isCameraActive ? (
                    <Button onClick={startCamera} className="flex-1 bg-primary hover:bg-primary/90">
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} variant="destructive" className="flex-1">
                      Stop Camera
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Note: QR scanning requires a compatible device. Try manual entry for demo.
                </p>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="member-id">Member ID</Label>
                  <Input
                    id="member-id"
                    placeholder="e.g., MEMBER-001"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualCheckin()}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Try: MEMBER-001, MEMBER-002, or MEMBER-003
                  </p>
                </div>
                <Button onClick={handleManualCheckin} className="w-full bg-primary hover:bg-primary/90">
                  Check In
                </Button>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Recent Check-in Summary */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="font-semibold text-foreground mb-4">Last Check-In</h3>
            {lastCheckin ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Member</p>
                  <p className="text-lg font-semibold text-foreground">{lastCheckin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={lastCheckin.type === 'checkin' ? 'default' : 'secondary'}>
                    {lastCheckin.type === 'checkin' ? 'Checked In' : 'Checked Out'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-mono text-sm">
                    {lastCheckin.timestamp?.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-foreground">{lastCheckin.plan}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent check-ins</p>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Check-ins</span>
                <span className="font-semibold text-foreground">64</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Check-outs</span>
                <span className="font-semibold text-foreground">52</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Members</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Hour</span>
                <span className="font-semibold text-foreground">6 PM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
