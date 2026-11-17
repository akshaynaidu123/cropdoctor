# CropDoctor — real crop-image analysis with Google Gemini

CropDoctor keeps its existing React/TypeScript/Vite interface, navigation, upload preview, mobile camera input, and report card. The Node/Express backend now uses the official `@google/genai` SDK. The `/api/analyze-crop` multipart endpoint and report JSON fields remain unchanged. There is no hardcoded crop/disease result, fake delay, filename prediction, or production mock response.

## Start in VS Code PowerShell

Requirements: Node.js 22.x, version 22.12+ (tested with 22.18), npm, and a Gemini Developer API key from [Google AI Studio](https://aistudio.google.com/api-keys).

```powershell
Set-Location 'D:\AKSHAY\UPSC\cropdoctor-main'
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Configure the ignored backend `.env` file:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=5000
HOST=127.0.0.1
FRONTEND_PORT=5173
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
API_PROXY_TARGET=http://127.0.0.1:5000
```

Place your actual key only in `.env`. `.env.example` must contain a placeholder. Never use a `VITE_` variable for a key. The existing `.gitignore` already ignores `.env`, other environment variants, test artifacts, and local crop photographs; it was retained. If a key was shared or committed in an example file, rotate it in AI Studio and update `.env`.

Start both servers with one command:

```powershell
npm run dev
```

Open the exact **Open CropDoctor** URL printed in the terminal, normally **http://127.0.0.1:5173/detection**. The launcher chooses another frontend port if necessary, connects the proxy to its own backend, and permits that exact local origin. Opening **http://127.0.0.1:5000/** redirects to the running interface. Ctrl+C stops both servers. Restart after editing environment values. Existing operating-system variables override `.env`.

For optional separate terminals, use `npm run dev:api` and `npm run dev:frontend`. Do not start `dev:api` alongside the combined `npm run dev` command. In separate-terminal mode, align the frontend origin with `FRONTEND_ORIGIN` and the API port with `API_PROXY_TARGET`.

## Model selection and free-tier eligibility

On 17 November 2026, the configured key's model listing included **`gemini-3.5-flash-lite`** with `generateContent` support. Live image/structured-output requests succeeded with that model. Google currently lists free-tier input and output for it; actual quota, regional eligibility, project restrictions, and billing tier are controlled by Google. Check [current pricing](https://ai.google.dev/gemini-api/docs/pricing) and your AI Studio project before the demonstration.

The code does not enable billing, create a paid project, or automatically switch models after a failure. Select a project that is on Google's Free tier if you require free usage; a model name alone does not force an already paid project onto the Free tier. Free quotas can be exhausted. The older `gemini-2.5-flash` in the original configuration is deprecated for new projects, so the current accessible model above was selected. See [Google's model documentation](https://ai.google.dev/gemini-api/docs/models).

List models accessible to your own key:

```powershell
npm run models:gemini
```

The command prints model names and whether `GEMINI_MODEL` is listed; it never prints the key. Listing confirms access, not quota or image/JSON capability. When changing models, choose one that supports both image input and structured JSON output. Model availability is not checked on every image request, avoiding unnecessary network calls. An unavailable configured model returns an actionable error rather than a silent fallback.

## Architecture and image handling

```text
Gallery / native mobile camera
  -> local preview and file validation
  -> multipart POST /api/analyze-crop (file field: image)
  -> Express CORS, request limits, Multer memory storage
  -> MIME + signature validation + actual Sharp decoding
  -> orientation correction, metadata removal, resize within 2048 x 2048
  -> Google GenAI models.generateContent
     contents.parts.inlineData = { mimeType, data: base64 image bytes }
     systemInstruction = observation-based crop prompt
     responseMimeType = application/json
     responseJsonSchema = JSON Schema derived from existing Zod schema
  -> completion/safety checks, JSON parsing, Zod status consistency checks
  -> existing frontend report or a useful error
```

JPG/JPEG, PNG, and WebP uploads are accepted up to **4 MiB** and **25 megapixels**. File contents must match the declared MIME type. Damaged and animated files are rejected. Valid images are decoded in memory and normalized to JPEG before Gemini receives them; inline MIME type is therefore `image/jpeg`, matching those actual normalized bytes. Original filenames and metadata are not forwarded to the model. Uploaded files are not saved or logged.

The Google SDK is explicitly configured for the Gemini Developer API, not Vertex AI, with the official Google endpoint, a 45-second timeout, and one attempt. The browser has a 75-second timeout. Abort signals propagate when a request is cancelled. Local limits remain 10 requests/minute/IP and two concurrent analyses. No raw SDK errors, credentials, or complete image contents are logged.

## Report and prompt behavior

The schema is shared between backend and frontend. All existing response fields remain:

`status`, `cropName`, `diseaseName`, `confidenceLevel`, `severity`, `description`, `symptoms`, `possibleCauses`, `treatment`, `prevention`, `recommendation`, and `disclaimer`.

- `status`: `healthy`, `diseased`, `uncertain`, or `unsupported`.
- `cropName` and `diseaseName` may be null when identification is not justified.
- Confidence is `low`, `medium`, or `high`, with no numerical percentage or accuracy claim.
- Severity is `none`, `mild`, `moderate`, `severe`, or `unknown`, describing visible damage only.
- Observed symptoms are separated from possible causes. The prompt examines color, chlorosis, lesions, rust-like pustules, curling, wilting, fungal-like growth, and damaged tissue.
- Healthy plants are not forced into a disease category. Unknown crops or inadequate photos remain uncertain; unsupported images have no disease or treatment arrays.
- Treatment is cautious and crop-specific when justified. The prompt disallows unverified pesticide names, doses, mixing ratios, and application schedules.

Structured JSON is requested from Gemini, then validated again locally. Invalid JSON, extra fields, contradictory healthy/diseased status, truncation, and safety-blocked responses never become successful reports. Confirm field actions with a local agricultural specialist; this remains a preliminary visual assessment.

## Gallery and camera demonstration

Choose an image, inspect its preview, and click **Analyze image**. Old results reset when you choose or remove a photo. Duplicate submissions are disabled. Failed requests show **Retry analysis**.

**Capture photo** uses native browser `capture="environment"` input. Supported mobile browsers handle camera permission; desktops may offer a file picker. This is on-demand photo analysis, not continuous video diagnosis. Use HTTPS for mobile access outside localhost. HEIC/HEIF files need conversion to JPG, PNG, or WebP.

## Validation commands

```powershell
npm run typecheck
npm run build
npm run check:server
npm test
npm run test:e2e
npm run lint
```

Browser tests use installed Edge/Chrome on Windows when detected. Else run `npx playwright install chromium`. Set `$env:PLAYWRIGHT_EXECUTABLE_PATH` for another executable. The isolated browser suite uses ports 5175 and 5176 and a backend with no real key. All mocked responses are in test files only.

Live model tests consume your Gemini quota and need three real photos:

```powershell
npm run test:live -- --healthy '.\local-test-images\healthy.jpg' --diseased '.\local-test-images\diseased.jpg' --different '.\local-test-images\different.jpg'
```

The live command starts an ephemeral real HTTP API and exercises the image decoder, official SDK, model, and response validation without mocks. Public [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) photos are present locally for the demonstration; exact source links are in ignored `local-test-images/SOURCES.md`. You may substitute your own photos.

On 17 November 2026, all three live requests succeeded: healthy tomato, symptomatic potato, and symptomatic maize, with different image-based reports. These are smoke tests, not an agricultural accuracy evaluation. See `VALIDATION_REAL_AI.md` for exact results.

## Troubleshooting

If `npm install` reports `Invalid Version:` with an empty version, check for an incomplete optional-dependency record in `package-lock.json`. The local failure on 17 November was an `@img/sharp-wasm32` / `@emnapi/runtime` record missing its version; it has been repaired and repeat `npm install` verified. Keep this repaired lockfile. There is no need to delete `.env` or change your Gemini key for this error.

| Failure | Action |
| --- | --- |
| Missing key / 503 | Configure `GEMINI_API_KEY` in `.env` and restart `npm run dev`; placeholders count as missing. |
| Rejected key / 503 | Check key restrictions, project permissions, and Gemini API access in Google AI Studio. |
| Model unavailable / 503 | Run `npm run models:gemini`, choose an accessible image/JSON model, set `GEMINI_MODEL`, restart. |
| Gemini quota / 429 | Inspect the project's free-tier model limits and retry after reset. Quota may vary by account/region; repeated retries cannot increase it. No paid model fallback occurs. |
| Local limit / 429 | Wait a minute or for an existing analysis to finish. |
| Malformed/incomplete report / 502 | Retry once or use a clearer crop photo; confirm the model supports structured output. |
| Timeout / 504 | Retry with a smaller, well-lit still photo and check network connectivity. |
| Invalid image / 400, 413, 415, 422 | Supply one genuine JPG/PNG/WebP under the size/dimension limit. Renaming an unsupported file is insufficient. |
| API not connected | Use `npm run dev` from this checkout and the exact printed URL; an old copy may be running elsewhere. |
| Origin denied / 403 | For separate-server setups, configure exact `FRONTEND_ORIGIN` values and restart the API. |

## Submission and deployment notes

Run `npm run dev` for the local evaluation. Demonstrate healthy, diseased, and different-crop photos; show evidence and qualitative uncertainty, preview/reset, invalid-upload errors, and the mobile layout. Keep AI Studio quota available for the presentation. Do not claim a confirmed diagnosis.

For Vercel, api/index.js exports the Express app as a Node Function, and vercel.json routes API requests before the React fallback. Follow VERCEL_DEPLOYMENT.md for server-side environment variables, exact Git commands, platform limits, and live verification. Other static-only hosts still need an API host. For local built-frontend preview, run the API separately and allow the preview origin.

The original assistant and weather pages retain their demonstration services; only crop-image analysis was migrated. Existing styling/layouts are unchanged apart from provider wording. The original OpenAI provider calls and environment dependencies are removed, along with unused `openai`, `@ai-sdk/openai-compatible`, and `ai` packages after verifying there were no other imports.

## Migration file inventory

Created: `scripts/list-gemini-models.js`.

Modified: `server/config.js`, `server/services/visionService.js`, `server/index.js`, `server/routes/analyze.js`, `shared/cropAnalysis.js`, `server/tests/api.test.js`, `server/tests/dev.test.js`, `server/tests/vision.test.js`, `scripts/test-live-ai.js`, `tests/browser/detection.spec.js`, `src/components/UploadCard.tsx`, `src/pages/index.tsx`, `src/pages/about.tsx`, `package.json`, `package-lock.json`, `.env.example`, this guide, and `VALIDATION_REAL_AI.md`. The ignored local `.env` was configured with the supplied Gemini key and selected model; obsolete OpenAI variables were removed without displaying credentials.

The existing `.gitignore`, upload/camera implementation, report card, route URL, and frontend API service contract required no structural change.
