# Pose videos — hosting & workflow

Pose **videos** are hosted in **Supabase Storage** (public `poses` bucket) and
streamed at runtime. Pose **images** stay bundled in `public/poses/*.png`.

## Why videos aren't bundled

Sanctuary is a Capacitor app — anything in `public/` is baked into the
APK/IPA. ~80 pose clips at ~4 MB each would be 300 MB+ in the binary, past
Google Play's 150 MB and Apple's 200 MB-cellular limits. Hosting them in
Storage keeps the binary small; the app streams + caches clips on demand. The
core practice (voice guidance + still images) stays fully offline.

## One-time setup

1. **Supabase dashboard → Storage → New bucket**
   - Name: `poses`
   - **Public bucket: ✓** (read-only public URLs; uploads still require the
     service-role key)
2. Have your service-role key ready (Project Settings → API → `service_role`).
   Never commit it or ship it to the client.

## Adding / updating videos

```bash
# 1. Drop the clip into the local staging dir (gitignored, NOT bundled).
#    Name it exactly after the pose key (see docs/kling-asana-prompts.md).
cp ~/Downloads/parsvottanasana.mp4 media/pose-videos/

# 2. Upload to Storage + refresh the manifest, in one step:
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
npm run poses:sync

# 3. Commit the regenerated manifest (the .mp4 itself is gitignored):
git add src/data/poseManifest.js && git commit -m "Add parsvottanasana pose video"
```

That's it — the clip now resolves in-app via
`${VITE_SUPABASE_URL}/storage/v1/object/public/poses/<file>`.

## How resolution works

- `src/data/poseManifest.js` (committed, auto-generated) lists which media
  exist: `IMAGE_FILES` (from `public/poses`) and `VIDEO_FILES` (from
  `media/pose-videos`).
- `scripts/build-pose-manifest.mjs` regenerates it on every
  `npm run dev` / `npm run build`. **Preserve-on-absent:** if
  `media/pose-videos/` is empty (fresh clone / CI), the committed
  `VIDEO_FILES` are kept rather than wiped — so videos still resolve
  without the local masters present.
- `PoseFigure` resolves a pose key → image (local) and video (Storage URL),
  case-insensitively, via the small `POSE_ALIASES` table for the two
  key↔filename mismatches. If a video fails to load (not uploaded yet, or
  offline) it falls back to the still image — no broken player.

## npm scripts

| Script | Does |
|---|---|
| `npm run poses` | Regenerate the manifest from disk (no upload). |
| `npm run poses:upload` | Upload `media/pose-videos/*.mp4` → Storage (needs env). |
| `npm run poses:sync` | Upload **then** regenerate manifest. The everyday command. |

`predev` / `prebuild` run `npm run poses` automatically.

## ⚠️ Local masters — BACK THESE UP

Two `media/` folders are **gitignored, so they exist only on this machine** —
git is no longer their backup. A disk loss = losing the masters.

| Folder | What | Source of truth elsewhere? |
|---|---|---|
| `media/pose-videos/` | `.mp4` video masters | Yes — also in Supabase Storage after `poses:sync` |
| `media/pose-source-png/` | pristine 840×840 source PNGs (pre-WebP), used as Kling/Nano Banana inputs | **No — only here.** Recoverable from git history (commit `e7a2740`) only until that history is ever purged. |

**Copy both to a backup** (cloud drive / external disk). The
`pose-source-png` folder especially — it's the only convenient copy of the
Kling source images; losing it means regenerating or re-extracting from
history.

Recover `pose-source-png` from history if needed:
```bash
mkdir -p media/pose-source-png
git ls-tree --name-only e7a2740 public/poses/ | grep '\.png$' | while read -r p; do
  git show "e7a2740:$p" > "media/pose-source-png/$(basename "$p")"
done
```

## Stills are WebP

`public/poses/*.png` were converted to `.webp` (q80, 158 MB → 3.8 MB) and
the source PNGs removed from the repo — see `scripts/convert-poses-webp.mjs`
/ `npm run poses:webp`. The in-app stills are WebP; the pristine PNGs for
image-generation tools live in `media/pose-source-png/` (above). **Kling and
most image tools don't accept WebP** — always upload from `pose-source-png/`,
not `public/poses/`.

## Follow-ups (not done yet)

- **Git history** still contains the ~90 MB of videos + ~120 MB of PNGs
  committed before these changes. Purging needs a history rewrite
  (git-filter-repo / BFG) + force-push — do it only if repo size becomes a
  real problem. (Note: a purge would also remove the `e7a2740` PNG-recovery
  path above, so back up `pose-source-png` first.)
- **CDN**: Supabase Storage egress is fine at launch; put Cloudflare in front
  if video bandwidth grows.
