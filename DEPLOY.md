# Deploying Cloverton Homes

Production is **clovertonhomes.com.au** on Hostinger Node.js hosting, deployed from
git. This is the whole procedure, plus the constraints that are not obvious from
reading the code — every one of them caused a real outage.

---

## 1. Hostinger settings

| Setting | Value |
|---|---|
| **Entry file** | `app.js` — not `server/dist/index.js`, not `dist/index.js` |
| **Application root** | the directory git deploys into |
| **Branch** | `production` |
| **Framework preset** | Express |
| **Node version** | 20.9+ (production currently runs v22.18.0) |

`app.js` is a small CommonJS bootstrap. It binds the port immediately — the host
kills an app that is slow to bind — then loads `server/dist/index.js`, which
prepares Next, mounts `/api`, and hands everything else to Next.

### The two directories

The host builds in one place and runs the app in another:

```
hbuilds/source/repository          <- npm install and the build run here
hbuilds/versions/<uuid>/nodejs     <- the app actually runs here
```

`.next` does not survive the copy between them, so a deploy can report success
and still start a runtime directory with no pages in it. `app.js` handles this by
checking for the build next to itself and building in place when it is missing.
That is why a first boot after deploy takes a few minutes.

Each deploy creates a new `versions/<uuid>` directory, so the in-place build runs
once per deploy.

---

## 2. Environment variables

Set these in the Node app's environment panel. Values are read **once at startup** —
changing one without restarting changes nothing.

| Variable | Value | If wrong |
|---|---|---|
| `DATABASE_URL` | Hostinger MySQL connection string | Pages load, all data empty |
| `BETTER_AUTH_SECRET` | **32+ characters**, random | Sign-in disabled; site stays up |
| `BETTER_AUTH_URL` | `https://clovertonhomes.com.au` | Login redirects fail |
| `BETTER_AUTH_TRUSTED_ORIGINS` | `https://clovertonhomes.com.au,https://www.clovertonhomes.com.au` | CORS rejects admin requests |
| `NODE_ENV` | `production` | Dev mode; wrong build path |
| `UPLOAD_DIR` | writable path **outside** the deploy directory | Uploaded images wiped each deploy |
| `DOCUMENT_STORAGE_DIR` | writable path **outside** the deploy directory | Generated tender PDFs wiped each deploy |
| `SMTP_*`, `MAIL_*` | Hostinger mailbox settings | Enquiry emails fail |

Do **not** set `PORT` — Hostinger injects it.

`UPLOAD_DIR` and `DOCUMENT_STORAGE_DIR` must sit outside the deploy tree
(`/home/<account>/private/...`), because each deploy replaces the checkout.

### Env files

`.env*` is gitignored, so the git deploy never carries one. The panel is the
better place — panel values survive a deploy, an uploaded file does not. If you
do upload a file, `server/.env` or `.env` both work; panel values win, because
dotenv does not overwrite variables that are already set.

**Never commit an env file.** `BETTER_AUTH_SECRET` signs every session cookie;
changing it signs all admins out.

---

## 3. Deploy

1. **Merge and push to `production`.** Confirm it landed:
   `git log --oneline -1 origin/production`
2. **Deploy in the Node app panel.** A push alone does not restart the process.
3. **Watch the deploy log.** `npm install` runs `postinstall`, which builds when
   the output is missing. A build failure exits non-zero, so the deploy fails
   loudly rather than shipping a tree that cannot start.
4. **Restart the app** — required after any environment change.
5. **Verify** (section 4). First boot may take 1–3 minutes while it builds in
   place; `/health` reports `"building"` throughout, which is normal.
6. **Purge the CDN cache** in hPanel if asset paths changed — i.e. after any
   change to the frontend.

---

## 4. Verify

```bash
curl -s https://clovertonhomes.com.au/health
curl -so /dev/null -w "%{http_code}\n" https://clovertonhomes.com.au/contact
curl -s "https://clovertonhomes.com.au/api/properties?limit=1" | head -c 120
```

`/health` is the single most useful endpoint. It is registered before anything
can fail, so its response classifies any failure without needing shell access:

| Response | Means | Do this |
|---|---|---|
| `{"status":"ok"}` | Running and serving | Nothing |
| `{"status":"building"}` | Building in place | Wait; watch `secondsInPhase` |
| `{"status":"preparing"}` | Next is starting | Wait ~30s |
| `{"status":"failed", "buildLog":[...]}` | Startup failed | Read `buildLog` — it carries the real error |
| LiteSpeed's **HTML** 503 page | Process not running at all | Check entry file and application root |

A JSON body always comes from the app. An HTML body always comes from the web
server answering on its behalf.

`/health` also reports `nodeVersion`, `cwd`, `machineMemoryMb` and
`containerMemoryMb` — useful when the host's environment differs from local.

Then load the site in a **private window**. A normal browser will keep serving
you cached HTML and hide whether the fix worked.

---

## 5. Constraints that are not obvious

Each of these caused an outage. Breaking one again will cause another.

### Build with webpack, never Turbopack

`build:web` is `next build --webpack`. The host's glibc is older than Next's
native SWC binary needs (`GLIBC_2.29 not found`), so Next falls back to WASM
bindings — and Turbopack refuses to run on those. Next 16 uses Turbopack by
default, so removing `--webpack` breaks every production build.

It is used locally too, deliberately: a local build that runs a different bundler
than production is a bug that cannot reproduce until it ships.

### Never fetch your own API from a server component

The app serves its API from the same Node process that renders pages. A server
component fetching `/api/...` over HTTP waits on the process already busy
rendering it, deadlocks, and times out as a 504 — the page then renders empty.

Query the database directly instead. `src/lib/properties.ts` is the pattern: one
function, shared by the REST route and the server component.

### One copy of `next`, `react` and `react-dom` — in the root only

`server/package.json` must not list them. Two copies means two Next runtimes and
two async context stores, which fails as
`Cannot read properties of undefined (reading 'validationLevel')`.

### Pin versions that the host resolves differently

The host retries `npm install` with `--legacy-peer-deps`, which re-resolves
ranges and can float a dependency past the lockfile. `better-auth` is pinned
exactly for this reason, after a minor release changed its types and broke the
production build while local stayed green.

### Build-time packages belong in `dependencies`

The host installs production dependencies only, and `tsc` runs from the repo
root. Anything in `devDependencies` is absent at build time — including
`@types/react`.

### Server imports need explicit `.js` extensions

`server/` is ESM. TypeScript does not add extensions, so `./thing` must be
written `./thing.js` or the compiled output fails with `ERR_MODULE_NOT_FOUND`.

### The CDN will cache HTML for a year if you let it

Next sets `s-maxage=31536000` on prerendered pages. The cache middleware in
`server/src/index.ts` overrides this **as the response goes out** (wrapping
`writeHead`), because setting it on the way in loses to Next. Documents get 60
seconds; content-hashed assets keep the immutable year.

If this breaks, the symptom is a page that loads unstyled on first visit while
clicking links looks fine — the cached HTML references asset hashes that no
longer exist, and client-side navigation bypasses it.

### Dev and production share one database

There is no staging copy. Local changes to listings, designs or tenders are live
changes. Schema changes are additive only.

### Local development

`cd server && npm run dev` — the unified server. Plain `npm run dev` at the root
runs bare `next dev`, which 404s every Express route.

---

## 6. When a deploy fails

1. **Read `/health`.** If `status` is `failed`, `buildLog` holds the last 60
   lines of the build's own output — the actual compiler error and the file it
   came from.
2. **If `/health` returns LiteSpeed HTML**, the process is not running: check the
   entry file (`app.js`) and the application root.
3. **If the site loads but looks unstyled**, it is the CDN cache, not CSS. Compare
   `curl -s 'https://clovertonhomes.com.au/?cb=123'` against the plain URL — if
   the cache-busted one is correct, purge the CDN.
4. **Reproduce the host locally** before guessing:
   ```bash
   git clone --branch production <repo> /tmp/hostsim && cd /tmp/hostsim
   npm install --omit=dev     # production deps only, as the host does
   ```
   This catches missing files, devDependency leaks, and build errors without
   spending a deploy.

---

## 7. Known issues

- `multer@1.x` has known vulnerabilities; 2.x is the fix. Not yet upgraded.
- `eslint@8` is end-of-life.
- Uploads use local filesystem storage. Files live in `UPLOAD_DIR` and are served
  at `/uploads`. There is no backup of that directory — take one before migrating
  the account.
