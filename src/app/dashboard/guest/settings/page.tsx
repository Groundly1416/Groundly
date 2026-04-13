'use client';

import { useEffect, useState } from 'react';
import { Camera, Loader2, Check } from 'lucide-react';
import { auth, storage } from '@/lib/services';
import type { Profile } from '@/types/database';

export default function GuestSettingsPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) return;
        setUser(profile);
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setAvatarUrl(profile.avatar_url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await storage.uploadAvatar(user.id, file);
      setAvatarUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await auth.updateProfile({
        full_name: fullName,
        phone: phone || null,
        bio: bio || null,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">Update your profile information</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{error}</div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          Profile updated successfully
        </div>
      )}

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-stone-100 p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-stone-400">
                  {fullName ? fullName[0].toUpperCase() : '?'}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-800 transition-colors">
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">{fullName || 'Your Name'}</p>
            <p className="text-xs text-stone-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-stone-900">Personal Information</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="input-field" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="input-field bg-stone-50 text-stone-400 cursor-not-allowed" />
          <p className="text-xs text-stone-400">Email cannot be changed here. Contact support if needed.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Optional"
            className="input-field" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-stone-700">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Tell hosts a bit about yourself"
            rows={3}
            className="input-field resize-none" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
