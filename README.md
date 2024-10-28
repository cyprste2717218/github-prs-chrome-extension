# Note: WORK IN PROGRESS

# Github PR Tracker Chrome Extension

![screenshot showing chrome extension tracking a number of repos](image/github_social_preview.png)

<br><br>
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Chrome extension that displays the number of open pull requests across tracked repositories (note: public repos only at current but this may change).

Built in React with TypeScript using Vite, utilising [shadcn/ui](https://ui.shadcn.com) components using tailwind on the frontend.

To-do: include link to chrome web store listing when out here

## How to Use

1). [Download the extension]('') from the chrome web store or [load an unpacked build](#local-setup) of the extension

![](image/README%20Set%20Up%20Screenshots/step1.png)
<br><br>
2). Choose the 'Enter Github Username' option
<br>
![](image/README%20Set%20Up%20Screenshots/step2-unauthenticated.png)
<br>
Alternatively, choose the 'Enter Github Username and PAT' to make authenticated requests, [this approach is discussed here]('')
<br><br>
![](image/README%20Set%20Up%20Screenshots/step2-authenticated.png)

3). Select the Repositories You Wish to Track
<span>
![](image/README%20Set%20Up%20Screenshots/step3.png)
![](image/README%20Set%20Up%20Screenshots/step3a.png)
</span>

4). Voila! If you want to refresh your pull request repo details, press the refresh button
![](image/README%20Set%20Up%20Screenshots/step4.png)

# Authenticated Approach

You can generate a Personal Access Token (classic) with no additional permissions <a target="_blank" href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic">following Github's guide here (opens new tab)</a>

# Local Setup

1). Install Node Package Manager (bundled with node) and clone the repository

2). Navigate into the repository directory and install dependencies with `npm install`

3). Run `npm run build`

4). In Chrome, go to chrome://extensions and enable "Developer mode" in the top-right corner.

5). Click the "<em>Load unpacked</em>" button and select the generated `dist/` directory

## FAQ/Gotchas

To be completed
