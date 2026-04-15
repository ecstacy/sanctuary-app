import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import GoogleIcon from '../components/GoogleIcon'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const fileInputRef = useRef(null)

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const doshaLabel = profile?.dosha || null
  const gender = profile?.gender || null
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const provider = user?.app_metadata?.provider
  const isGoogle = provider === 'google'

  // ── Edit name state ──
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(fullName)
  const [savingName, setSavingName] = useState(false)

  // ── Gender state ──
  const [savingGender, setSavingGender] = useState(false)

  // ── Photo upload state ──
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // ── Password change state ──
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null) // { type: 'success'|'error', text }
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  async function handleSaveName() {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === fullName) {
      setEditingName(false)
      setNameValue(fullName)
      return
    }

    setSavingName(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
      setEditingName(false)
    } catch (err) {
      console.error('Failed to update name:', err.message)
      alert('Could not update name. Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.')
      return
    }

    setUploadingPhoto(true)
    try {
      // Create a unique file path
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filePath = `${user.id}/avatar.${ext}`

      // Upload to Supabase Storage (bucket: avatars)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData?.publicUrl
      if (!publicUrl) throw new Error('Could not get public URL')

      // Add cache-buster to force refresh
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

      // Save URL to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithCacheBust })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
    } catch (err) {
      console.error('Photo upload failed:', err.message)
      alert('Could not upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
      // Clear the input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleGenderSelect(value) {
    // If tapping the already-selected gender, deselect it
    const newGender = value === gender ? null : value
    setSavingGender(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gender: newGender })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
    } catch (err) {
      console.error('Failed to update gender:', err.message)
    } finally {
      setSavingGender(false)
    }
  }

  async function handleChangePassword() {
    setPasswordMsg(null)

    if (!newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all fields.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setSavingPassword(true)
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (signInError) {
        setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' })
        setSavingPassword(false)
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setChangingPassword(false), 1500)
    } catch (err) {
      console.error('Password change failed:', err.message)
      setPasswordMsg({ type: 'error', text: err.message || 'Could not update password.' })
    } finally {
      setSavingPassword(false)
    }
  }

  function resetPasswordForm() {
    setChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMsg(null)
    setShowCurrentPw(false)
    setShowNewPw(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-28">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* Avatar & Name */}
        <div className="flex flex-col items-center pt-4 pb-2 stagger-1">

          {/* Avatar with edit overlay */}
          <div className="relative mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                <span className="font-headline text-3xl text-primary">{initials}</span>
              </div>
            )}
            {/* Camera overlay button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-on-primary text-sm">photo_camera</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Editable name */}
          {editingName ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <input
                type="text"
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') { setEditingName(false); setNameValue(fullName) }
                }}
                autoFocus
                maxLength={60}
                className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-center font-headline text-xl text-on-surface outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
              >
                {savingName ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-on-primary text-sm">check</span>
                )}
              </button>
              <button
                onClick={() => { setEditingName(false); setNameValue(fullName) }}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-sm">close</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameValue(fullName); setEditingName(true) }}
              className="flex items-center gap-2 group active:scale-95 transition-all"
            >
              <h1 className="font-headline text-2xl text-on-surface">{fullName}</h1>
              <span className="material-symbols-outlined text-on-surface-variant/30 text-sm group-hover:text-primary transition-colors">edit</span>
            </button>
          )}

          <p className="font-body text-sm text-on-surface-variant mt-1">{email}</p>
          {isGoogle && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-surface-container rounded-full">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Google</span>
            </div>
          )}
        </div>

        {/* Dosha card */}
        <button
          onClick={() => navigate(doshaLabel ? '/dosha' : '/quiz')}
          className="bg-primary-container rounded-lg p-5 text-left w-full active:scale-[0.98] transition-all stagger-2"
        >
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
            Dosha Type
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-xl text-on-surface">
                {doshaLabel || 'Undiscovered'}
              </h3>
              <p className="font-body text-xs text-on-surface-variant mt-1">
                {doshaLabel ? 'Tap to view your Dosha profile' : 'Take the quiz to discover your dosha'}
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl opacity-40">spa</span>
          </div>
        </button>

        {/* Account info */}
        <div className="bg-surface-container rounded-lg overflow-hidden stagger-3">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest px-5 pt-5 pb-3">
            Account
          </p>

          <button
            onClick={() => { setNameValue(fullName); setEditingName(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex items-center gap-4 px-5 py-4 border-b border-surface-container-high w-full text-left active:bg-surface-container-high/50 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
            <div className="flex-1">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Name</p>
              <p className="font-body text-sm text-on-surface">{fullName}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">edit</span>
          </button>

          <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">mail</span>
            <div className="flex-1">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Email</p>
              <p className="font-body text-sm text-on-surface">{email}</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="flex items-center gap-4 px-5 py-4 border-b border-surface-container-high w-full text-left active:bg-surface-container-high/50 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">photo_camera</span>
            <div className="flex-1">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Profile Photo</p>
              <p className="font-body text-sm text-on-surface">
                {uploadingPhoto ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload a photo'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">upload</span>
          </button>

          {/* Gender */}
          <div className="px-5 py-4 border-b border-surface-container-high">
            <div className="flex items-center gap-4 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">wc</span>
              <div className="flex-1">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Gender</p>
                <p className="font-body text-[10px] text-on-surface-variant/40 mt-0.5">Optional · helps personalize recommendations</p>
              </div>
              {savingGender && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="flex gap-2">
              {[
                { value: 'male', label: 'Male', icon: 'male' },
                { value: 'female', label: 'Female', icon: 'female' },
                { value: 'other', label: 'Other', icon: 'diversity_1' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleGenderSelect(opt.value)}
                  disabled={savingGender}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-label text-xs tracking-wide transition-all active:scale-95 disabled:opacity-50 ${
                    gender === opt.value
                      ? 'bg-primary-fixed text-primary font-semibold'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <span className={`material-symbols-outlined text-sm ${gender === opt.value ? 'text-primary' : 'text-on-surface-variant/50'}`}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isGoogle ? (
            <div className="flex items-center gap-4 px-5 py-4">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">key</span>
              <div className="flex-1">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Sign-in method</p>
                <p className="font-body text-sm text-on-surface">Google</p>
              </div>
            </div>
          ) : changingPassword ? (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Change Password</p>
                <button onClick={resetPasswordForm} className="text-on-surface-variant/40 active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Current password */}
              <div className="relative mb-3">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 pr-11 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30"
                >
                  <span className="material-symbols-outlined text-lg">{showCurrentPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* New password */}
              <div className="relative mb-3">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 pr-11 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30"
                >
                  <span className="material-symbols-outlined text-lg">{showNewPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative mb-3">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
                />
              </div>

              {/* Feedback message */}
              {passwordMsg && (
                <p className={`font-body text-xs mb-3 ${passwordMsg.type === 'success' ? 'text-primary' : 'text-error'}`}>
                  {passwordMsg.text}
                </p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center gap-4 px-5 py-4 w-full text-left active:bg-surface-container-high/50 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
              <div className="flex-1">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Password</p>
                <p className="font-body text-sm text-on-surface">Change password</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
            </button>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-surface-container rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all stagger-4"
        >
          <span className="material-symbols-outlined text-error text-lg">logout</span>
          <span className="font-label text-sm font-semibold text-error tracking-wide">Sign Out</span>
        </button>

        <p className="text-center font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest pb-4">
          The Sanctuary · v1.0
        </p>

      </div>

      <BottomNav />

    </div>
  )
}
