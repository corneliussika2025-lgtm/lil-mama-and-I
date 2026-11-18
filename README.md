# A Little Game About Us ❤️ — GitHub Pages edition

This edition is hosted as a static site on GitHub Pages. Supabase provides the private answer database and password-authenticated dashboard. GitHub Pages alone cannot run a database or server-side password checks.

## 1) Create the private answer database
1. Create a project at https://supabase.com/.
2. Open **SQL Editor**, paste the full contents of `supabase-setup.sql`, and run it.
3. Open **Project Settings → API** (or API Keys). Copy the Project URL and the `anon` / publishable public key.
4. In this project, edit `config.js` and paste those two values. The anon key is intended to be public in browser apps; never paste a `service_role` key.
5. In Supabase **Authentication → Users**, create your own admin user with an email and a strong password. Disable public sign-ups if you do not need them.

## 2) Publish with GitHub Pages
1. Create a new GitHub repository, for example `little-game-about-us`.
2. Upload `index.html`, `style.css`, `app.js`, `config.js`, and `supabase-setup.sql` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish. Your public game URL will look like `https://YOUR-USERNAME.github.io/little-game-about-us/`.

## 3) Use the private dashboard
Visit your published game URL with `#admin` appended:
`https://YOUR-USERNAME.github.io/little-game-about-us/#admin`

Sign in with the admin email/password you created in Supabase. Submitted answers will appear in this dashboard.

## Privacy and deployment notes
- The game submits answers to Supabase only when she taps **Send your answers**.
- Anonymous visitors can INSERT submissions but cannot SELECT/read them. Only authenticated users can read submissions under the included row-level security policy.
- Never place a Supabase `service_role` key, database password, or admin password in this repository.
- The GitHub repository can be public because the browser anon key is designed for client-side use; the database row-level security rules protect the answers.
- Anyone can still submit junk data to a public form. For a real public launch, consider adding CAPTCHA/anti-spam and rate limiting.
- `#admin` is only a convenient route to the sign-in screen, not a security mechanism. Supabase authentication and database row-level security provide the access control.
