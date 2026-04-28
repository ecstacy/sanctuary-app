import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import i18n from '../i18n'
import { SUPPORTED_LANGUAGES, writeStoredLanguage } from '../i18n/detect'
import useConsent from '../hooks/useConsent'
import useScrollDepth from '../hooks/useScrollDepth'
import { exportUserData } from '../lib/dataExport'
import { deleteAllUserData } from '../lib/accountDeletion'
import { track, reset as resetAnalytics, EVENTS } from '../lib/track'

import GoogleIcon from '../components/GoogleIcon'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const fileInputRef = useRef(null)
  useScrollDepth('profile')

  // ── Language switcher state ──
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false)
  const [savingLanguage, setSavingLanguage] = useState(false)

  // ── Privacy / analytics consent ──
  const { consent, setAggregate } = useConsent()
  const [privacyExpanded, setPrivacyExpanded] = useState(false)

  // ── Data export / account deletion (GDPR Art. 15/17) ──
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null) // 'done' | 'error' | null
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteResult, setDeleteResult] = useState(null)

  async function handleExport() {
    if (!user?.id || exporting) return
    setExporting(true)
    setExportStatus(null)
    const result = await exportUserData(user.id)
    track(EVENTS.DATA_EXPORTED, { ok: result.ok })
    setExportStatus(result.ok ? 'done' : 'error')
    setExporting(false)
    // Clear the confirmation line after a few seconds so the row returns
    // to its default state.
    setTimeout(() => setExportStatus(null), 4000)
  }

  async function handleConfirmDelete() {
    if (deleting) return
    setDeleting(true)
    // Fire the event BEFORE we delete + reset analytics. After
    // resetAnalytics() runs, distinct_id is gone and PostHog can't
    // attribute the deletion event to the right person.
    track(EVENTS.ACCOUNT_DELETED, {})
    const result = await deleteAllUserData(user.id)
    // Drop our local analytics identity so the next anon session can't
    // be back-joined to the deleted user. Server-side PostHog erasure is
    // handled inside deleteAllUserData via the posthog-delete-person
    // Edge Function (deployed separately) — that fully removes the
    // person row and all linked events on the PostHog side.
    resetAnalytics()
    setDeleteResult(result)
    setDeleting(false)
    // Whatever happened, the user is signed out inside deleteAllUserData.
    // Give them a beat to read the outcome, then bounce them to the
    // welcome page.
    setTimeout(() => {
      navigate('/', { replace: true })
    }, result.ok ? 1500 : 3500)
  }

  async function handleToggleAggregate(next) {
    // Fire the event BEFORE flipping the flag if we're turning OFF, so
    // the analytics layer is still alive and the event actually lands.
    // When turning ON, the flag must flip first or the event itself is
    // gated out — so we fire after.
    if (!next) {
      track(EVENTS.CONSENT_CHANGED, { kind: 'aggregate', granted: false })
    }
    // 1. Flip the local, sticky state first — UI reacts instantly.
    const updated = setAggregate(next)
    if (next) {
      track(EVENTS.CONSENT_CHANGED, { kind: 'aggregate', granted: true })
    }
    // 2. Best-effort mirror to the profile row so the choice follows the
    //    user across devices. Tolerates a missing column gracefully.
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ analytics_consent: updated })
        .eq('id', user.id)
      if (profileError && !/column .* does not exist/i.test(profileError.message)) {
        console.error('Consent save failed:', profileError.message)
      }
    } catch (err) {
      console.error('Consent update failed:', err?.message || err)
    }
  }

  async function handleChangeLanguage(code) {
    if (!SUPPORTED_LANGUAGES.includes(code)) return
    setSavingLanguage(true)
    // 1. Apply immediately so the UI reacts.
    i18n.changeLanguage(code)
    writeStoredLanguage(code)
    // 2. Persist on the profile if the column exists; swallow the error
    //    gracefully if the migration hasn't been applied yet (the local
    //    sticky + auth_metadata copy are still good enough).
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ language: code })
        .eq('id', user.id)
      if (profileError && !/column .* does not exist/i.test(profileError.message)) {
        console.error('Language save failed:', profileError.message)
      }
      // 3. Mirror onto auth user_metadata so it's available before the
      //    profile row loads on next launch.
      await supabase.auth.updateUser({ data: { language: code } })
      await refreshProfile()
    } catch (err) {
      console.error('Language update failed:', err.message)
    } finally {
      setSavingLanguage(false)
      setLanguagePickerOpen(false)
    }
  }

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
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label="Close profile"
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
              aria-label="Upload profile photo"
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
                aria-label="Display name"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                aria-label="Save name"
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
                aria-label="Cancel"
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

        {/* Language */}
        <div className="bg-surface-container rounded-lg overflow-hidden stagger-3">
          <button
            onClick={() => setLanguagePickerOpen(!languagePickerOpen)}
            className="flex items-center gap-4 px-5 py-4 w-full text-left active:bg-surface-container-high/50 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">language</span>
            <div className="flex-1">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{t('profile.language')}</p>
              <p className="font-body text-sm text-on-surface">
                {t(`languages.${i18n.language}.label`, { defaultValue: i18n.language })}
              </p>
            </div>
            {savingLanguage ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className={`material-symbols-outlined text-on-surface-variant/30 text-sm transition-transform ${languagePickerOpen ? 'rotate-180' : ''}`}>expand_more</span>
            )}
          </button>

          {languagePickerOpen && (
            <div className="px-5 pb-4 pt-1 flex flex-col gap-2">
              <p className="font-body text-[11px] text-on-surface-variant/60 mb-1">
                {t('profile.languageHint')}
              </p>
              {SUPPORTED_LANGUAGES.map(code => {
                const meta = t(`languages.${code}`, { returnObjects: true }) || {}
                const selected = i18n.language === code
                return (
                  <button
                    key={code}
                    onClick={() => handleChangeLanguage(code)}
                    disabled={savingLanguage}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
                      selected ? 'bg-primary-container' : 'bg-surface-container-low'
                    }`}
                  >
                    <span className="text-lg">{meta.flag}</span>
                    <span className="font-body text-sm text-on-surface flex-1 text-left">{meta.label}</span>
                    {selected && (
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

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
                <button onClick={resetPasswordForm} className="text-on-surface-variant/40 active:scale-90 transition-all" aria-label="Close password form">
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
                  aria-label="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30"
                  aria-label="Toggle password visibility"
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
                  aria-label="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30"
                  aria-label="Toggle password visibility"
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
                  aria-label="Confirm new password"
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

        {/* Privacy */}
        <div className="bg-surface-container rounded-lg overflow-hidden stagger-3">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">shield</span>
            <div className="flex-1 min-w-0">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{t('profile.privacy.aggregateTitle')}</p>
              <p className="font-body text-xs text-on-surface-variant/80 mt-0.5 leading-snug">
                {consent.aggregate ? t('profile.privacy.aggregateOn') : t('profile.privacy.aggregateOff')}
              </p>
            </div>
            {/* Custom toggle — keeps UI language consistent with the rest of
                the app (no native <input type=checkbox>) */}
            <button
              onClick={() => handleToggleAggregate(!consent.aggregate)}
              role="switch"
              aria-checked={consent.aggregate}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                consent.aggregate ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-on-primary shadow-sm transition-all ${
                  consent.aggregate ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* "What we collect" expand — plain language, not legalese */}
          <button
            onClick={() => setPrivacyExpanded(!privacyExpanded)}
            className="flex items-center gap-4 px-5 py-3 w-full text-left active:bg-surface-container-high/50 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant/60 text-base">info</span>
            <p className="flex-1 font-body text-xs text-on-surface-variant">
              {t('profile.privacy.whatWeCollect')}
            </p>
            <span className={`material-symbols-outlined text-on-surface-variant/30 text-sm transition-transform ${privacyExpanded ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {privacyExpanded && (
            <div className="px-5 pb-5 pt-1 space-y-4">
              {/* What we DO collect */}
              <ul className="space-y-1.5">
                {(t('profile.privacy.collectedList', { returnObjects: true }) || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary/70 text-[14px] mt-0.5">check</span>
                    <span className="font-body text-[12px] text-on-surface-variant leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {/* What we NEVER collect — as prominent as the above */}
              <div>
                <p className="font-label text-[10px] text-on-surface-variant/70 uppercase tracking-wider mb-1.5">
                  {t('profile.privacy.neverCollectHeading')}
                </p>
                <ul className="space-y-1.5">
                  {(t('profile.privacy.neverCollectList', { returnObjects: true }) || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-[14px] mt-0.5">close</span>
                      <span className="font-body text-[12px] text-on-surface-variant leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-body text-[11px] text-on-surface-variant/60 italic pt-1">
                {t('profile.privacy.changeAnytime')}
              </p>

              {/* Vendor disclosure — required by EAA/GDPR. Names the
                  processor, where the data lives, and links to their
                  privacy policy so the user can read the full DPA. */}
              <div className="pt-2 border-t border-outline-variant/15">
                <p className="font-label text-[10px] text-on-surface-variant/70 uppercase tracking-wider mb-1.5">
                  Analytics provider
                </p>
                <p className="font-body text-[12px] text-on-surface-variant leading-relaxed">
                  Aggregate analytics are processed by{' '}
                  <a
                    href="https://posthog.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    PostHog
                  </a>
                  {' '}on EU-hosted infrastructure (Frankfurt). No PII is sent;
                  events use a per-install pseudonymous id. Turn the toggle
                  above off at any time and we stop sending anything.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Your data — GDPR export + account deletion */}
        <div className="bg-surface-container rounded-lg overflow-hidden stagger-4">
          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest px-5 pt-5 pb-3">
            {t('profile.yourData.section')}
          </p>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-4 px-5 py-4 border-b border-surface-container-high w-full text-left active:bg-surface-container-high/50 transition-colors disabled:opacity-60"
            aria-label="Export your data"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">download</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-on-surface">
                {t('profile.yourData.exportTitle')}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant/80 mt-0.5">
                {exporting
                  ? t('profile.yourData.exportWorking')
                  : exportStatus === 'done'
                  ? t('profile.yourData.exportDone')
                  : exportStatus === 'error'
                  ? t('profile.yourData.exportError')
                  : t('profile.yourData.exportBody')}
              </p>
            </div>
            {exporting ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
            )}
          </button>

          {/* Delete */}
          <button
            onClick={() => { setDeleteConfirmText(''); setDeleteResult(null); setDeleteOpen(true) }}
            className="flex items-center gap-4 px-5 py-4 w-full text-left active:bg-surface-container-high/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[#b33a3a] text-lg">delete_forever</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-[#b33a3a]">
                {t('profile.yourData.deleteTitle')}
              </p>
              <p className="font-label text-[11px] text-on-surface-variant/80 mt-0.5">
                {t('profile.yourData.deleteBody')}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-surface-container rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all stagger-4"
        >
          <span className="material-symbols-outlined text-error text-lg">logout</span>
          <span className="font-label text-sm font-semibold text-error tracking-wide">{t('profile.signOut')}</span>
        </button>

        <p className="text-center font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest pb-4">
          The Sanctuary · v1.0
        </p>

      </div>

      {/* ── Delete account confirmation — rendered at page level so it
           overlays the Profile content. Requires typing DELETE to arm the
           destructive button (guards against accidental taps). */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center px-4 pb-6 pt-6"
          onClick={() => !deleting && !deleteResult && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container rounded-2xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {deleteResult ? (
              // Post-delete confirmation view
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-primary-container mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {deleteResult.ok ? 'check' : 'info'}
                  </span>
                </div>
                <p className="font-headline text-lg text-on-surface mb-2">
                  {deleteResult.ok
                    ? t('profile.yourData.deleteDone')
                    : t('profile.yourData.deletePartial')}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4">
                  <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                  <div className="flex-1">
                    <h3 className="font-headline text-lg text-on-surface mb-1">
                      {t('profile.yourData.deleteConfirmTitle')}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      {t('profile.yourData.deleteConfirmBody')}
                    </p>
                  </div>
                </div>

                <label className="block mb-4">
                  <p className="font-label text-[11px] text-on-surface-variant mb-1.5">
                    {t('profile.yourData.deleteConfirmPrompt')}
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder={t('profile.yourData.deleteConfirmPlaceholder')}
                    aria-label="Type DELETE to confirm"
                    autoFocus
                    autoCapitalize="characters"
                    className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-error/40 transition-all placeholder:text-on-surface-variant/35"
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteOpen(false)}
                    disabled={deleting}
                    className="flex-1 py-3 bg-surface-container-low rounded-full font-label text-xs font-semibold tracking-wide text-on-surface active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                    className="flex-1 py-3 bg-[#b33a3a] text-white rounded-full font-label text-xs font-semibold tracking-wide active:scale-[0.97] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {deleting && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {deleting
                      ? t('profile.yourData.deleteWorking')
                      : t('profile.yourData.deleteConfirmCta')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
