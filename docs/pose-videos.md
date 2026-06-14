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

## Local masters

Keep your `media/pose-videos/*.mp4` masters backed up — they're gitignored,
so they live only on your machine + in Storage. Storage is the production
source of truth; the local dir is your working copy + re-upload source.

## Follow-ups (not done yet)

- **Stills are ~158 MB of PNG.** Converting `public/poses/*.png` → WebP would
  cut that ~70% and meaningfully shrink the app binary. Separate task.
- **Git history** still contains the ~90 MB of videos committed before this
  change. Purging them needs a history rewrite (git-filter-repo / BFG) +
  force-push — do it only if repo size becomes a real problem.
- **CDN**: Supabase Storage egress is fine at launch; put Cloudflare in front
  if video bandwidth grows.
