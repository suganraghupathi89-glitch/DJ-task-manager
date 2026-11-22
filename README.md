# DJ-task manager

Personal task app. Four themes switch automatically: No tasks, Ahead, Countdown (deadline within 48h), Rest (task finished, nothing close).

## Get the APK (no Android Studio needed)
1. Create a GitHub repo and push this folder to the `main` branch.
2. Open the repo's **Actions** tab, then **Build APK**, then **Run workflow** (it also runs on every push).
3. When it finishes, download **DJ-task-manager-apk** from the run, unzip it, and install `app-debug.apk` on your phone (allow "install unknown apps").

GitHub Actions is free: unlimited minutes on public repos, 2,000 minutes/month on private repos.

## Build locally instead
`npm install`, `npm run fonts`, `npx cap add android`, add the POST_NOTIFICATIONS permission to the manifest, `npx cap sync android`, then open `android/` in Android Studio and build.

## Edit the app
All UI and logic live in `www/` (`index.html`, `style.css`, `app.js`).
