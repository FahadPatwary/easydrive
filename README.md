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

**Service account (default, easiest).** No consent screen, no "unverified app" warning, no expiry.
1. Google Cloud Console: create a project and enable the **Google Drive API**.
2. IAM & Admin > Service Accounts > Create service account (no roles needed). Open it > Keys > Add key > JSON. A key file downloads.
3. In Google Drive, share the folder or Shared Drive you want to publish with the service account's email (`client_email` in the file) as **Viewer**.
4. Paste the key file contents and the folder link into the setup wizard.

The service account only sees what you share with it. Share more folders any time, or use a Shared Drive and add the account as a member.

**Google sign-in (OAuth), for your whole My Drive.**
- Enable the Drive API; OAuth consent screen: External, Publishing status **In production** (otherwise Google expires the connection after 7 days; the "unverified app" warning is expected for your own app).
- Credentials > OAuth client ID > Web application > Authorised redirect URI: `https://<your-worker>/oauth/callback`.

## Security notes
- Passwords are hashed with PBKDF2-SHA256 (100k iterations). Sessions are random tokens stored hashed, 30-day expiry.
- Login is rate limited (5 failures per IP per 15 minutes). State-changing requests check Origin and a custom header.
- Google access is read-only (`drive.readonly`) in both modes. Disconnecting revokes the OAuth token at Google; in service-account mode, removing the key stops access, and you can delete the key in Google Cloud Console.
- Without `SECRET_KEY`, the service-account key (or the OAuth client secret and refresh token) sits unencrypted in your private D1 database.

## Local development
```
npm install
npm run dev
```
Wrangler runs the worker with a local D1 database. Google OAuth needs the redirect URI to match, so add
`http://localhost:8787/oauth/callback` to your OAuth client when testing locally.
