# CropDoctor Vercel deployment

## Root cause and fix

The live `/api/health` and `/api/analyze-crop` returned HTTP 200 HTML containing the React page. The previous catch-all rewrite sent every URL to `index.html`, and there was no root `/api` Function entry. Vite's local proxy and the local Express listener do not create a production API.

`api/index.js` now default-exports the existing Express app without calling `.listen()`. It reads server runtime variables without loading the local `.env`. `vercel.json` routes `/api/:path*` to that Function before a React fallback that excludes API paths. Gemini, Multer, Sharp, and Zod are reused. Frontend requests remain relative `/api/analyze-crop` on the same origin. Unknown API paths return JSON 404; GET analysis returns JSON 405 with `Allow: POST, OPTIONS`.

The project dashboard was set to the old TanStack Start preset and Node 24. The repository now explicitly selects **Vite**, build **`npm run build`**, output **`dist`**, and **Node 22.x**. The Vercel CLI build confirmed these overrides and emitted `api/index` as a Node Function. There is no extra API host to start on Vercel.

## Runtime environment

Use the existing project **akshaynaidu123s-projects/cropdoctor**, repository **akshaynaidu123/cropdoctor**, branch **main**, root **`.`**. Align the dashboard preset with Vite if it still displays TanStack Start; checked-in configuration already overrides it.

In **Project Settings → Environment Variables**, confirm actual values for the **Production** environment:

```dotenv
GEMINI_API_KEY=your_actual_Google_AI_Studio_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

Both names were listed by Vercel, but a local production-environment pull returned empty values. Verify the actual values rather than relying on variable names alone. No secret values were printed or added to committed files. Set Preview variables too if preview deployments should run Gemini.

An optional `FRONTEND_ORIGIN=https://cropdoctor-nu.vercel.app` explicitly permits the canonical domain. The app also allows exact same-origin requests and Vercel deployment/branch/production URLs from system environment variables, including custom domains, without allowing arbitrary `*.vercel.app` origins. Vercel's trusted edge supplies the forwarded protocol/client IP.

Never use `VITE_GEMINI_API_KEY` or commit real keys in `.env.example`. Environment changes need a **new deployment**. `PORT`, `HOST`, and `API_PROXY_TARGET` are local-development settings and do not fix production routing.

## Upload, execution, and memory limits

Vercel documents a **4.5 MB total request/response payload limit** for Node Functions. The app now accepts image files up to **4 MiB** in browser validation, Multer, and the image decoder, leaving room for multipart boundaries/headers. A platform-generated non-JSON 413 also produces a useful frontend size error. Raising a body-parser setting cannot bypass the platform cap.

The Function has **maxDuration 60 seconds**. Gemini has one attempt and a **45-second timeout**, reserving time for image decoding, response validation, and JSON delivery. The browser timeout remains 75 seconds. Decoding remains bounded at 25 megapixels with at most two concurrent analyses per instance.

Current Node/Fluid Hobby memory is 2 GB. The local Vercel build produced a **25.1 MiB** Function bundle with no `.env` files bundled, below the documented 250 MB bundle limit. This measurement is from Windows; a Git-triggered Vercel build installs the appropriate Linux Sharp binaries. Deploy via Git rather than uploading Windows native artifacts with `--prebuilt`.

In-memory request/concurrency limits are per warm instance, not a distributed global quota. Retain Google project quota controls and configure Vercel access protection for the intended audience.

Sources: [Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [Function limits](https://vercel.com/docs/functions/limitations), [execution duration](https://vercel.com/docs/functions/configuring-functions/duration).

## Exact Git commands for PowerShell

These stage the complete fix explicitly while leaving private environment files out:

```powershell
Set-Location 'D:\AKSHAY\UPSC\cropdoctor-main'
git switch main
git status --short
git add .gitignore .vercelignore api/index.js vercel.json package.json package-lock.json server/app.js server/config.js server/routes/analyze.js server/services/imageService.js server/services/visionService.js server/tests/vercel.test.js shared/cropAnalysis.js src/context/LanguageContext.tsx src/services/cropService.ts src/services/imageValidation.ts tests/browser/detection.spec.js SETUP_REAL_AI.md VALIDATION_REAL_AI.md VERCEL_DEPLOYMENT.md
git diff --cached --check
git diff --cached --stat
git commit -m "Fix Vercel Function routing for Gemini crop analysis"
git push origin main
```

The current origin is already `https://github.com/akshaynaidu123/cropdoctor.git`. If a push is rejected because `main` advanced, run `git pull --rebase origin main`, resolve conflicts, rerun checks, then push. Do not force-push.

In Vercel Deployments, wait for that exact new commit to become Ready. Confirm its output includes **api/index as a Function**, alongside static frontend assets. A successful Vite build alone is insufficient. The agent prepared and tested these changes locally; no commit, Git push, or production deployment was performed.

## Verify production after redeployment

### Health must return JSON

```powershell
curl.exe -i 'https://cropdoctor-nu.vercel.app/api/health'
$health = Invoke-RestMethod -Uri 'https://cropdoctor-nu.vercel.app/api/health'
if ($health -is [string] -or $health.ok -ne $true) { throw 'Expected JSON API health, not React HTML.' }
if (-not $health.configured) { throw 'Configure the actual Production GEMINI_API_KEY value and redeploy.' }
```

Expected: HTTP 200, `Content-Type: application/json`, and `{"ok":true,"configured":true}`. Configured means a key exists, not that Gemini accepts it or quota remains.

### Submit a real photograph

Use a genuine JPG/PNG/WebP under 4 MiB. The local ignored sample photos are available in this checkout:

```powershell
$imagePath = (Resolve-Path '.\local-test-images\different.jpg').Path
curl.exe -i --max-time 65 --request POST 'https://cropdoctor-nu.vercel.app/api/analyze-crop' --header 'Origin: https://cropdoctor-nu.vercel.app' --form "image=@$imagePath"
```

Expected: HTTP 200 JSON with image-specific crop/status, observations, possible causes, and recommendations. Check relevance to the photo; try another crop and a healthy leaf. Uncertainty is valid. No API key is needed in the curl request or browser.

For 429, inspect Gemini free-tier quota. For 503, inspect server key/model configuration. For 500/502/504, inspect Vercel Function logs. These failures must not produce a disease report.

### Check API errors and React routes

```powershell
curl.exe -i 'https://cropdoctor-nu.vercel.app/api/unknown'
curl.exe -i 'https://cropdoctor-nu.vercel.app/api/analyze-crop'
```

Expected: JSON 404 and JSON 405 respectively, with no `<!DOCTYPE html>`.

Open `/detection`, upload and analyze through the UI, and confirm the Network panel uses a same-origin POST to `/api/analyze-crop`. Refresh `/about`, `/weather`, and `/assistant` directly; these should still render React. Files over 4 MiB should be rejected before uploading. Renamed text files should fail without a report.

If API paths still return HTML, verify the repository root, deployed commit, Function output, and rewrite order. If no api/index Function appears, the wrong configuration/root or an older commit is being built.

## Validation scope

Backend/Function tests cover actual multipart transport with isolated provider responses, missing production keys, exact CORS/custom aliases, method errors, and Gemini error handling. Desktop/mobile tests cover image-size validation and platform 413 errors. The Vercel CLI build emitted the Node 22 Function and API-before-SPA routes.

A separate check through **Vercel's local runtime** returned JSON health, JSON 404, 415 for disguised content, 413 for oversized upload, and **HTTP 200 with a real Gemini maize/corn-rust assessment**. That test used actual uploaded bytes and Gemini, not a mock report.

The live site was verified to return HTML at API paths before this fix. Production success remains unverified until the new commit is redeployed and the live checks above pass.
