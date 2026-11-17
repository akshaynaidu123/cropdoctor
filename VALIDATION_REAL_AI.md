# Gemini migration validation — 17 November 2026

Environment: Windows PowerShell, Node 22.18.0, npm 11.6.2. Model: `gemini-3.5-flash-lite`. Provider: Gemini Developer API through official `@google/genai` 3.4.0. This checkout has no `.git` directory; Git diff/status comparison was unavailable.

## Executed checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; frontend emitted to `dist` |
| `npm run check:server` | Passed |
| `npm test` | 19 passed, 0 failed, including nested outcome cases |
| `npm run test:e2e` | 18 passed, 0 failed; desktop and mobile viewport settings |
| Real Gemini model listing | Configured model listed for the supplied key with `generateContent` support |
| Live healthy/diseased/different-crop test | All three real requests succeeded through the HTTP endpoint, image decoder, Gemini SDK, and Zod validation |
| Dependency installation/removal audit | npm reported 0 vulnerabilities |
| Real browser using the running app and Gemini | Passed: maize image uploaded through the actual UI; a possible corn-rust report and final recommendation rendered successfully |
| Production asset and example credential scan | Passed: no backend key, Gemini endpoint, or SDK authentication header in frontend output; example contains a placeholder |
| ESLint on changed implementation/test files | Passed with 0 errors |
| Repository-wide lint | 47 existing Prettier errors and 7 existing React Fast Refresh warnings in unrelated files |

The build has existing non-fatal warnings: two Zod annotation comments are removed by Rollup, and the main JavaScript bundle is about 521 kB before gzip. No warning was suppressed. Unrelated formatting was retained to respect migration scope.

## Actual live model results

Command executed without mocks:

```powershell
npm run test:live -- --healthy local-test-images/healthy.jpg --diseased local-test-images/diseased.jpg --different local-test-images/different.jpg
```

| Photograph | Model status | Crop identification | Possible condition |
| --- | --- | --- | --- |
| Healthy leaf | `healthy` | Tomato | No named disease; uniform green coloration, intact margins, no visible spots/lesions reported |
| Symptomatic leaf | `diseased` | Potato | Possible Late Blight or Early Blight; necrotic lesions, chlorosis, and tissue damage reported |
| Different crop | `diseased` | Maize | Possible Common Rust or Southern Rust; reddish-brown pustules and damaged patches reported |

These summaries record actual generated output from this run, not predictions embedded in the app. Model descriptions remain tentative and may vary. They do not establish classifier accuracy or confirmed plant diagnoses.

An additional browser check used the restarted application at `http://127.0.0.1:5173/detection`, selected the maize photo, and clicked Analyze image without intercepting the API. Gemini returned a possible corn-rust report, and the existing report card displayed qualitative confidence, observations, possible causes, care, prevention, and a final recommendation. A full-page screenshot is saved locally at ignored `test-results/gemini-live-report.png`. This confirms the running app, proxy, backend, model, and frontend rendering worked together; it is separate from mocked automated UI tests.

Photos came from the public PlantVillage dataset. Exact source URLs are in ignored `local-test-images/SOURCES.md`. Original filenames and dataset labels are not passed to the model. Only the photograph and observation prompt are sent.

## Automated coverage

- Real JPEG/PNG/WebP decoding; missing, empty, disguised, MIME-mismatched, corrupt, excessive-size, malformed multipart, and wrong-field uploads rejected before AI.
- Healthy, diseased, uncertain, unsupported, and different-crop reports validated against the preserved contract.
- Official Google SDK transport tested with an isolated fetch stub: actual base64 image bytes and MIME type, system prompt, JSON response schema, and no credentials in request body/URL.
- Missing keys, key rejection, unavailable model, Gemini quota/429, network/provider failures, timeouts, aborts, safety blocks, truncated output, malformed JSON, extra confidence scores, and contradictory status are tested.
- Combined startup owns both services, skips another app's occupied frontend port, preserves that app, configures CORS for the selected origin, and redirects the API root to the actual interface.
- Desktop/mobile upload, preview, reset, duplicate prevention, loading, retry, camera-file input, quota/configuration errors, and existing routes pass without document-level horizontal overflow.
- Mock responses exist only in isolated test files; live tests and production have no fallback predictions.

## Configuration and remaining limits

The supplied Gemini key was originally in `.env.example`. It was transferred to ignored `.env`, and the example was sanitized to a placeholder. Keep the real key in `.env`; rotate it if the example was shared or committed. The prior OpenAI integration failed with an exhausted balance; OpenAI is no longer called by the migrated code.

The selected model is listed by Google with a free tier, but model listing cannot prove project billing tier or remaining quota. The implementation does not enable billing or fall back to paid models. Project/region eligibility and limits remain Google's responsibility.

Physical mobile camera hardware/permission prompts and publicly hosted deployment were not exercised. Existing assistant/weather demonstration services remain outside this migration. Reports are preliminary visual assessments requiring expert confirmation.

See `SETUP_REAL_AI.md` for exact PowerShell startup commands, model configuration, troubleshooting, and the complete migration file inventory.
