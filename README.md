# Healthy Hannah

Installable PWA: daily plan, one-tap check-offs, habits, reminders, progress, a daily verse and affirmation.

- No build step, no server. Plain HTML/CSS/JS.
- Data stays on her phone (localStorage, IndexedDB for saved images). Backup/restore under More.
- Hosted on GitHub Pages from `main` (root).

## Install on iPhone
1. Open the Pages URL in **Safari**.
2. Share → **Add to Home Screen**.
3. Open it from the Home Screen. More → Reminders → **Add reminders to Calendar** so alerts reach her iPhone and Apple Watch.

## Updating
Edit, bump `VERSION` in `app.js` and `CACHE` in `sw.js`, push to `main`. The installed app picks it up after a full close and reopen.

## Not included (by choice)
Apple Health, Apple Watch and Ring-Con sync. A web app can't read HealthKit, and the Ring-Con only talks to the Switch, so fully automatic sync isn't possible without a native app.
