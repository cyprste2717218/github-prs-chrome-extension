# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome extension (Manifest V3) that displays the number of open pull requests across GitHub repositories a user tracks. Built with React + TypeScript + Vite, shadcn/ui components, and Tailwind CSS on the frontend; a Chrome MV3 background service worker handles polling GitHub's REST API (via `@octokit/request`) on an alarm schedule.

## Commands

- `npm run dev` — Vite dev server (for UI iteration; the extension itself must be loaded unpacked in Chrome to test service worker/alarm behavior)
- `npm run build` — `tsc -b && vite build`, outputs to `dist/` (load this directory as an unpacked extension via `chrome://extensions`)
- `npm run lint` — lint with `xo` (config in `xo-config.ts`, prettier-integrated)
- `npm run lint-fix` — `xo src --fix --prettier`
- `npm run pretty-check` / `npm run pretty-format` — prettier check/write over `src/**/*.{js,jsx,ts,tsx}`
- `npm test` — runs all three suites in sequence: `test:unit`, `test:it`, `test:end`
  - `npm run test:unit` — Jest, matches `**/*.unit.test.ts`
  - `npm run test:it` — Jest, matches `**/*.it.test.ts` (integration; `test/integration/` currently empty)
  - `npm run test:end` — Jest, matches `**/*.end.test.ts` (e2e; uses Puppeteer, see `test/e2e/`)
  - To run a single test file directly: `npx jest path/to/file.unit.test.ts`
- Docker (for running e2e tests / a JSON mock server rather than shipping the extension):
  - `npm run docker-build` — builds the Puppeteer-based image from `browser-extension.dockerfile` (entrypoint runs `npm run test:end`)
  - `npm run docker-run` — runs that container
  - `docker-compose.yml` also spins up a `json-server` serving `data/db.json` on port 3000, mounted from `./data`

## Git hooks (husky)

- `pre-commit`: auto-formats with prettier (`npm run run-pretty`) and runs `npm audit`
- `pre-push`: runs `npm run build` to confirm the extension still builds

## Git conventions

Each commit message should be at most 30 characters in total and always start with one of the following prefixes depending on the changes made:

- `chore:`

For most changes which help implement code as part of an overarching feature, where it be source code or automated tests. The feature it is contributing to is ideally indicated by the name of the current branch (which should start with the `feat/` prefix).

- `fix:`

For any changes which implement a bug fix, which could have been identified during implementation of a feature or pulled from a GitHub issue.

For either type of commit, the diff should be small and focused as far as this is possible and ideally not change more than 5 files at the same time or exceed a total of 200 changed lines of code.
Each commit should pass the git hooks in the `pre-commit` and `pre-push` checks, however if in order to meet this diff standard these checks fail then the commit pre-fix must be followed by `(WIP):` before the colon, e.g. `chore(WIP):`


## Architecture

### Two runtime contexts

The extension has two independent execution contexts that only communicate through `chrome.storage`:

1. **Popup UI** (`src/App.tsx` and everything under `src/components/`) — a normal React app rendered in the extension popup (`index.html`). It reads/writes `chrome.storage.local` and `chrome.storage.session` and listens for storage changes via `useChromeStorageListener` (`src/utilities/hooks/useChromeStorageListener.ts`) to stay in sync with what the background service worker does.
2. **Background service worker** (`src/utilities/service-worker-funcs/`) — a separate MV3 service worker with no shared memory/state with the popup. Built as a *separate* Vite entry point (see `vite.config.ts` — `service-worker`, `background`, `alarms`, `storage-utils` are all built as standalone non-hashed `[name].js` files, referenced directly by filename in `public/manifest.json`'s `background.service_worker`).

Because these run in separate contexts, **all cross-context communication is via `chrome.storage`**, not message passing. The popup's `App.tsx` loads initial state from `chrome.storage.local` on mount and subscribes to `chrome.storage.onChanged` per key. The service worker persists results back to storage after each poll, which the popup picks up via those listeners.

### Storage helpers

`src/utilities/service-worker-funcs/storage-utils.ts` wraps `chrome.storage.local`/`chrome.storage.session` in promise-based helpers (`loadFromLocalStorage`, `saveToLocalStorage`, `loadAllFromLocalStorage`, `saveAllToLocalStorage`, and session-storage equivalents). All values are JSON-stringified on write and parsed on read. Use these rather than calling `chrome.storage` directly — this is the pattern used everywhere in the codebase.

### Alarm-driven polling

- `src/utilities/service-worker-funcs/service-worker.ts` is the entry point: it registers `chrome.alarms.onAlarm`, `chrome.storage.onChanged`, and `chrome.runtime.onInstalled` listeners.
- `src/utilities/service-worker-funcs/alarms.ts` (`handleAlertAlarm`, `handleCreateAlarm`, `handleDeleteAlarm`, `handleLocalStorageStepChanges`) contains the alarm lifecycle logic. There are two alarm types:
  - `pollingAlarm` — recurring alarm (interval derived from the user-configured polling rate via `getDelay`) that triggers `startPolling` to refetch PR counts for tracked repos.
  - `rateLimitErrorAlarm` — a one-shot alarm created when GitHub rate-limits/errors a request; when it fires, the polling alarm is recreated and polling resumes.
- The polling alarm is created/destroyed based on which "step" (see below) the popup UI is on — `handleLocalStorageStepChanges` watches `chrome.storage` changes to the `step` key and creates the alarm only when `step === 4` (the "tracking repos" screen).
- `src/utilities/polling/polling.ts` (`startPolling`, `makePollingCall`) and `src/utilities/polling/utils/` contain the actual GitHub-fetching logic, including authenticated (PAT) vs unauthenticated request paths, redirect handling, retry-on-network-error logic, and rate-limit/token-expiry detection (`src/utilities/polling/utils/fetchNumPRsUtils.ts`).

### Popup step flow

The popup UI is a linear wizard driven by a numeric `step` value persisted in storage, rendered by `src/components/StepComponent.tsx`:
1. `ChooseSetupOptComponent` — choose username-only vs username+PAT setup
2. `GitDetailsEntryComponent` — enter GitHub username / PAT
3. `ChooseReposComponent` — select which public repos to track (paginated via GitHub API `link` headers)
4. `DisplayTrackedReposComponent` — main tracking view; this is the step during which the polling alarm is active
5. `SettingsComponent` — adjust polling rate, etc.

### Error/toast handling

`src/utilities/errorHandlingUtilities.ts` classifies GitHub API errors (rate limits, network errors, generic request errors) into typed error objects (see `src/models/utilities/ServiceWorkerFuncsModels.ts`) with an associated `waitInterval`, which drives `rateLimitErrorAlarm` scheduling. `src/utilities/toastMessages.ts` + `src/components/ToastMessages.tsx` map these to `sonner` toast messages shown in the popup. Toasts in the service worker context itself (`service-worker.ts`) are best-effort since the service worker has no persistent DOM — actual toast rendering happens in the popup once it observes the relevant storage/session key change.

### Path alias

`@/*` resolves to `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`) — use this for new imports rather than deep relative paths.

### Data directory

`data/` holds mock JSON server fixtures (`db.json`, `routes.json`) used by the `json-server` docker-compose service, not application data.
