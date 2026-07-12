# Note: WORK IN PROGRESS

# Github PR Tracker Chrome Extension

![screenshot showing chrome extension tracking a number of repos](image/github_social_preview.png)

<br><br>
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/manifest%20v3-chrome%20extension-4285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)
![Jest](https://img.shields.io/badge/jest-%23C21325.svg?style=for-the-badge&logo=jest&logoColor=white)
![Puppeteer](https://img.shields.io/badge/puppeteer-%2340B5A4.svg?style=for-the-badge&logo=puppeteer&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)
[![Build Status](https://img.shields.io/github/actions/workflow/status/cyprste2717218/github-prs-chrome-extension/test.yml?style=for-the-badge&label=build)](https://github.com/cyprste2717218/github-prs-chrome-extension/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg?style=for-the-badge)](LICENSE)

Chrome extension that displays the number of open pull requests across tracked repositories (note: public repos only at current but this may change).

Built in React with TypeScript using Vite, utilising [shadcn/ui](https://ui.shadcn.com) components using tailwind on the frontend.

To-do: include link to chrome web store listing when out here

## Contents

- [How to Use](#how-to-use)
- [Authenticated Approach](#authenticated-approach)
- [Local Setup](#local-setup)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Testing](#testing)
- [Git hooks (husky)](#git-hooks-husky)
- [FAQ/Gotchas](#faqgotchas)

## How to Use

<div align="center">
	<img src="image/demo.gif" width="550" />
</div>
<br>

1). [Download the extension]('') from the chrome web store or [load an unpacked build](#local-setup) of the extension

2). Choose the 'Enter Github Username' option, alternatively you can choose the 'Enter Github Username and PAT' to make authenticated requests, [this approach is discussed here]('#Authenticated Approach')

3). Select the Repositories You Wish to Track

4). Voila! If you want to refresh your pull request repo details, press the refresh button

# Authenticated Approach

You can generate a Personal Access Token (classic) with no additional permissions <a target="_blank" href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic">following Github's guide here (opens new tab)</a>

# Local Setup

1). Install Node Package Manager (bundled with node) and clone the repository. An `.nvmrc` is included, so if you use `nvm` run `nvm use` to pick up the correct Node version.

2). Navigate into the repository directory and install dependencies with `npm install`

3). Run `npm run build`

4). In Chrome, go to chrome://extensions and enable "Developer mode" in the top-right corner.

5). Click the "<em>Load unpacked</em>" button and select the generated `dist/` directory

# Project Structure

```
├── public/                        # manifest.json, icons — copied as-is into dist/
├── src/
│   ├── components/                # popup UI (React) — StepComponent.tsx drives the wizard flow
│   │   ├── header/
│   │   ├── input/
│   │   ├── repo-cards/
│   │   └── ui/                    # shadcn/ui primitives
│   ├── models/                    # shared TypeScript types (frontend + utilities)
│   ├── utilities/
│   │   ├── hooks/                 # e.g. useChromeStorageListener
│   │   ├── polling/                # GitHub PR-count fetching logic
│   │   └── service-worker-funcs/  # MV3 background service worker (alarms, storage-utils)
│   ├── App.tsx
│   └── main.tsx
├── test/
│   ├── unit/                      # Jest, *.unit.test.ts
│   ├── integration/               # Jest, *.it.test.ts (currently empty)
│   └── e2e/                       # Puppeteer, *.end.test.ts
├── data/                          # json-server mock fixtures (db.json, routes.json)
├── image/                         # README screenshots/demo assets
├── browser-extension.dockerfile
├── docker-compose.yml
└── vite.config.ts                 # defines the extension's separate build entry points
```

# Development

- `npm run dev` — starts a Vite dev server for iterating on the popup UI. This only renders the React app in a browser tab; the service worker/alarm/polling behaviour can only be exercised by loading `dist/` as an unpacked extension (see [Local Setup](#local-setup)).
- `npm run lint` / `npm run lint-fix` — lint with `xo` (prettier-integrated)
- `npm run pretty-check` / `npm run pretty-format` — check/write formatting with prettier
- `npm test` — runs `test:unit`, `test:it`, then `test:end` in sequence. See [Testing](#testing) below before running this.
- Commit messages follow a specific short, prefixed convention (`chore:`/`fix:`, small focused diffs) — see the "Git conventions" section in [CLAUDE.md](CLAUDE.md) if you're contributing.

## Testing

- `npm run test:unit` — Jest unit tests (`**/*.unit.test.ts`)
- `npm run test:it` — Jest integration tests (`**/*.it.test.ts`) — currently empty, reserved for future use
- `npm run test:end` — Puppeteer end-to-end tests (`**/*.end.test.ts`)

The e2e suite needs a fresh `dist/` build to run against and launches a real (non-headless) Chrome window, and it currently hits the live GitHub API rather than the mock JSON server — see [FAQ/Gotchas](#faqgotchas) for details before running it.

## Git hooks (husky)

- `pre-commit` auto-formats staged files with prettier **and runs `npm audit`** — a commit can be blocked by an unrelated dependency vulnerability, not just your changes.
- `pre-push` runs a full `npm run build` to confirm the extension still builds.

## FAQ/Gotchas

**`npm run test:end` (or `npm test`) fails or loads an old version of the extension** — the e2e suite loads the extension straight from `dist/`, so run `npm run build` first. Also note Puppeteer runs with `headless: false` here, so it'll pop open a real Chrome window locally; use `npm run docker-run` (or `docker-setup`) to run it headlessly/reliably instead.

**e2e tests fail with rate-limit errors that don't look related to my change** — despite the `json-server` mock backed by `data/db.json`, the e2e test currently queries the real GitHub API unauthenticated (e.g. the `facebook` org), so it's subject to GitHub's 60 requests/hour unauthenticated rate limit. Repeated local runs or a shared CI IP can trip this. Switching the e2e suite over to the JSON mock server is planned.
