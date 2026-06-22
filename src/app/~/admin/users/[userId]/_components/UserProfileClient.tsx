"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ShieldAlert, MonitorSmartphone, Mail, Lock, LogIn } from "lucide-react";
import {
  updateUserAdminDetails,
  toggleUserSuspension,
  forcePasswordReset,
  updateAdminNotes,
  sendDirectUserEmail,
  clearUserDeviceLock
} from "../actions";

export function UserProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "user");
  
  const [adminNotes, setAdminNotes] = useState(user.adminNotes || "");
  
  const [suspensionDays, setSuspensionDays] = useState("3");
  const [suspensionReason, setSuspensionReason] = useState(user.suspensionReason || "");

  const [directEmailSubject, setDirectEmailSubject] = useState("");
  const [directEmailHtml, setDirectEmailHtml] = useState("");

  const handleUpdateDetails = async () => {
    setLoading("details");
    const result = await updateUserAdminDetails(user.id, { name, email, role });
    if (result.success) {
      toast.success("User details updated.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  const handleUpdateNotes = async () => {
    setLoading("notes");
    const result = await updateAdminNotes(user.id, adminNotes);
    if (result.success) {
      toast.success("Admin notes saved.");
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  const handleForcePasswordReset = async () => {
    if (!confirm("Are you sure you want to reset this user's password?")) return;
    setLoading("password");
    const result = await forcePasswordReset(user.id);
    if (result.success) {
      toast.success("Password reset and email sent.");
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  const handleToggleSuspension = async (isSuspending: boolean) => {
    setLoading("suspension");
    
    let suspendedUntil = null;
    if (isSuspending) {
      if (suspensionDays === "indefinite") {
        suspendedUntil = new Date("2099-01-01");
      } else {
        suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(suspensionDays));
      }
    }

    const result = await toggleUserSuspension(user.id, suspendedUntil, isSuspending ? suspensionReason : "");
    if (result.success) {
      toast.success(isSuspending ? "User suspended." : "User unsuspended.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  const handleClearDeviceLock = async () => {
    if (!confirm("Are you sure you want to clear their device lock?")) return;
    setLoading("device");
    const result = await clearUserDeviceLock(user.email);
    if (result.success) {
      toast.success("Device lock cleared.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  const handleSendEmail = async () => {
    if (!directEmailSubject || !directEmailHtml) return toast.error("Fill in all fields.");
    setLoading("email");
    const result = await sendDirectUserEmail(user.id, directEmailSubject, directEmailHtml);
    if (result.success) {
      toast.success("Email sent!");
      setDirectEmailSubject("");
      setDirectEmailHtml("");
    } else {
      toast.error(result.error);
    }
    setLoading(null);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="security">Security & Access</TabsTrigger>
        <TabsTrigger value="communication">Communication</TabsTrigger>
        <TabsTrigger value="notes">Admin Notes</TabsTrigger>
      </TabsList>

      {/* OVERVIEW TAB */}
      <TabsContent value="overview" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity Details</CardTitle>
            <CardDescription>Update basic user information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 border-t">
            <Button onClick={handleUpdateDetails} disabled={loading === "details"}>
              {loading === "details" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Details
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impersonation</CardTitle>
            <CardDescription>Log in exactly as this user to debug issues.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full sm:w-auto">
              <LogIn className="w-4 h-4 mr-2" />
              Login as {user.name || "User"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              * Requires setting an impersonation token. Coming soon!
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SECURITY & ACCESS TAB */}
      <TabsContent value="security" className="space-y-6 mt-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50/50">
            <CardTitle className="text-red-600 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              Account Suspension
            </CardTitle>
            <CardDescription>
              {user.active ? "Temporarily or permanently ban this user from logging in." : `Currently suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {!user.active ? (
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="font-semibold text-amber-900 mb-1">User is Suspended</p>
                <p className="text-sm text-amber-800">Reason: {user.suspensionReason}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Suspension Duration</Label>
                    <Select value={suspensionDays} onValueChange={setSuspensionDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="indefinite">Indefinite (Permaban)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Suspension Reason (Shown to user)</Label>
                  <Input 
                    value={suspensionReason} 
                    onChange={e => setSuspensionReason(e.target.value)} 
                    placeholder="e.g. Suspected account sharing"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t py-4">
            {user.active ? (
              <Button variant="destructive" onClick={() => handleToggleSuspension(true)} disabled={loading === "suspension"}>
                {loading === "suspension" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Suspend Account
              </Button>
            ) : (
              <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleToggleSuspension(false)} disabled={loading === "suspension"}>
                {loading === "suspension" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lift Suspension Early
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Password Reset
              </CardTitle>
              <CardDescription>Force a password reset via email.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleForcePasswordReset} disabled={loading === "password"}>
                {loading === "password" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate & Send New Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MonitorSmartphone className="w-4 h-4 mr-2" />
                Device Lock (Anti-Piracy)
              </CardTitle>
              <CardDescription>
                {user.claimedOrder ? `Locked to device: ${user.claimedOrder.deviceKey.substring(0, 8)}...` : "No device lock found."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                disabled={!user.claimedOrder || loading === "device"}
                onClick={handleClearDeviceLock}
              >
                {loading === "device" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Clear Device Fingerprint
              </Button>
              {user.claimedOrder && user.claimedOrder.resetHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Reset History:</p>
                  <ul className="text-xs space-y-1">
                    {user.claimedOrder.resetHistory.map((rh: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span>{new Date(rh.timestamp).toLocaleDateString()}</span>
                        <span className="text-slate-400">Old: {rh.previousDeviceKey.substring(0,6)}...</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* COMMUNICATION TAB */}
      <TabsContent value="communication" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Direct Email
            </CardTitle>
            <CardDescription>Send an email exclusively to {user.email}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={directEmailSubject} onChange={e => setDirectEmailSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea 
                  className="min-h-[200px] font-mono text-sm" 
                  value={directEmailHtml} 
                  onChange={e => setDirectEmailHtml(e.target.value)} 
                  placeholder={`<p>Hi {{name}},</p>\n<p>Your refund has been processed.</p>`}
                />
              </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 border-t">
            <Button onClick={handleSendEmail} disabled={loading === "email"}>
              {loading === "email" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Email
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* NOTES TAB */}
      <TabsContent value="notes" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Private Admin Notes</CardTitle>
            <CardDescription>These notes are only visible to administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-[300px]" 
              value={adminNotes} 
              onChange={e => setAdminNotes(e.target.value)} 
              placeholder="e.g. Jan 12: User requested refund..."
            />
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 border-t">
            <Button onClick={handleUpdateNotes} disabled={loading === "notes"}>
              {loading === "notes" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Notes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
