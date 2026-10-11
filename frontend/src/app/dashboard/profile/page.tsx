'use client';
import { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from '@/features/profile/profileApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Sync state with query data when loaded
  useState(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ first_name: firstName, last_name: lastName }).unwrap();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('avatar', e.target.files[0]);
      try {
        await uploadAvatar(formData).unwrap();
        alert('Avatar uploaded successfully!');
      } catch (error) {
        alert('Failed to upload avatar.');
      }
    }
  };

  if (isLoadingProfile) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 perspective-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white neon-text-glow">Profile Settings</h1>
        <p className="text-white/60 mt-1 text-lg">Manage your personal information and preferences.</p>
      </div>

      <Card className="glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
        <CardHeader className="px-8 pt-8 border-b border-white/5">
          <CardTitle className="text-white text-2xl neon-text-glow">Profile Picture</CardTitle>
          <CardDescription className="text-white/60 font-medium">Personalize your account with a photo.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-8 flex items-center space-x-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-black/40 border border-white/20 shadow-[0_0_15px_rgba(100,50,255,0.3)] flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserPlaceholder />
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(100,50,255,0.8)] neon-glow">
              <Camera className="w-5 h-5 text-white" />
              <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
            </label>
          </div>
          <div className="text-sm font-semibold text-white/50">
            <p>Recommended: Square image, max 5MB.</p>
            {isUploading && <p className="text-primary mt-2 flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Uploading...</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0 rounded-3xl shadow-[0_0_20px_rgba(100,50,255,0.2)] card-3d">
        <CardHeader className="px-8 pt-8 border-b border-white/5">
          <CardTitle className="text-white text-2xl neon-text-glow">Personal Information</CardTitle>
          <CardDescription className="text-white/60 font-medium">Update your name and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white/90 font-semibold">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary neon-glow" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/90 font-semibold">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus-visible:ring-primary neon-glow" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold">Email Address</Label>
                <Input 
                  value={profile?.user?.email || ''} 
                  disabled 
                  className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed h-12 rounded-xl shadow-inner" 
                />
                <p className="text-xs font-semibold text-white/40">Email cannot be changed directly.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold">Phone Number</Label>
                <Input 
                  value={profile?.user?.phone || ''} 
                  disabled 
                  className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed h-12 rounded-xl shadow-inner" 
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 rounded-xl px-8 font-semibold shadow-[0_0_15px_rgba(100,50,255,0.5)] text-primary-foreground" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <svg className="w-14 h-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
