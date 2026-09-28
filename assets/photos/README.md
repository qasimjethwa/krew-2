# Source photos

Drop licensed photos here named by key, then run `npm run images`:

`running`, `gym`, `cycling`, `badminton`, `tennis`, `pickleball`, `football`, `yoga`, `swimming`, `dance`
(activity tiles) · `auth` (login/sign-up panel) · `onboarding` (onboarding side panel)

Accepted: .jpg/.jpeg/.png/.webp, ideally ≥1600px on the long edge. Optional `alt.json` overrides alt text.
The script grades every photo consistently, converts to WebP (≤1600px), creates blur placeholders and
writes `lib/photo-manifest.ts`. Until a photo exists, the branded placeholder tile is shown.
