# Drive Index

Your Google Drive on the web, behind **one username and password**. Self-hosted on Cloudflare Workers.

You connect Google once. After that you (and anyone you give the login to) open the site, sign in with the username and password, and browse, preview and download files. No Google sign-in, and Google access is read-only.

## How it works
1. Deploy this repo as a Cloudflare Worker (below).
2. Open the worker URL. First run shows a **setup wizard**:
   create Google OAuth credentials, choose a username/password, click **Connect Google Drive**.
3. From then on the site is protected by that login. The **Settings** page (gear icon) lets you
   change the password, pick which folder or Shared Drive is shown, reconnect or disconnect Google,
   and sign out other devices.

Everything (login, sessions, the Google connection) is stored in a Cloudflare **D1** database in your own account.

## Deploy
1. Push this repo to GitHub.
2. Cloudflare dashboard > Workers & Pages > Create > Import a repository > pick the repo.
   Deploy command: `npx wrangler deploy`. Wrangler creates the D1 database (`drive-index`) for you.
   If your Wrangler is too old to do that, run `npx wrangler d1 create drive-index` and add the printed
   `database_id` to `wrangler.toml`.
3. **Recommended:** add a secret `SETUP_KEY` (any long random string) before you open the site, so nobody else
   can claim a fresh deployment. The setup page will ask for it.
4. Optional: add a secret `SECRET_KEY` (long random string) to encrypt the stored Google credentials inside D1.
5. Open `https://<your-worker>.workers.dev` and follow the wizard.

### The Google part (the wizard walks you through it)
- Google Cloud Console > create a project > enable **Google Drive API**.
- OAuth consent screen: External, then set Publishing status to **In production** (otherwise Google expires the
  connection after 7 days). You will see an "unverified app" warning for your own app; that is expected.
- Credentials > OAuth client ID > Web application > Authorised redirect URI: `https://<your-worker>/oauth/callback`.

## Security notes
- Passwords are hashed with PBKDF2-SHA256 (100k iterations). Sessions are random tokens stored hashed, 30-day expiry.
- Login is rate limited (5 failures per IP per 15 minutes). State-changing requests check Origin and a custom header.
- The Google connection is read-only (`drive.readonly`). Disconnecting revokes the token at Google.
- Without `SECRET_KEY`, the Google client secret and refresh token sit unencrypted in your private D1 database.

## Local development
```
npm install
npm run dev
```
Wrangler runs the worker with a local D1 database. Google OAuth needs the redirect URI to match, so add
`http://localhost:8787/oauth/callback` to your OAuth client when testing locally.
