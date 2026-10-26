<p align="center">
  <img src="assets/logo.svg" alt="GITHUB_SNAKE.EXE Logo" width="120" height="120" />
</p>

# GITHUB_SNAKE.EXE — Interactive GitHub Contribution Engine

<p align="center"><b>English</b> · <a href="README.md">Español</a></p>

> **An AI snake (BFS + Flood Fill) that devours your GitHub contribution graph: playable at 60 FPS in the browser, as an animated SVG on your profile, and as a duel between two real GitHub profiles.**

<p align="center">
  <img src="assets/hero_preview.png" alt="GITHUB_SNAKE.EXE preview" width="100%" />
</p>

<p align="center">
  <a href="https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/?lang=en">
    <img src="https://img.shields.io/badge/LIVE_DEMO-TRY_IT_IN_YOUR_BROWSER-00ff66?style=for-the-badge&logo=github&logoColor=black" alt="Live demo" />
  </a>
</p>

---

## What you can do

| | |
| :--- | :--- |
| **Watch the AI eat your graph** | Type any GitHub username. A breadth-first-search snake hunts your real commits, with a Flood Fill check so it never traps itself. Sub-pixel interpolation keeps it smooth at 60 FPS. |
| **Put it on your profile** | A GitHub Action runs the same engine every day and publishes an animated SVG. Pick the theme (Matrix, Light, Cyberpunk, Cyan, Amber), snake shape and speed with a live preview on the site. |
| **Profile Duel** | Two real profiles, the same AI and 60 seconds. The GitHub that feeds its snake the most points wins. Results depend only on the tick count, so a shared link (`?u=you&vs=rival`) gives the same winner on any machine. |
| **Play it yourself** | Manual mode (WASD / arrows / touch D-pad) and a local duel against the AI. |
| **Commit Art** | Type a word and download a Git script that backdates empty commits so the word appears on your contribution graph. |

---

## Put the snake on your GitHub profile

The easiest way: open the [site](https://luisrodriguez-rgb.github.io/GITHUB_SNAKE.EXE/?lang=en), click **Add to my profile (Workflow)**, choose a style and copy the generated files. Or do it by hand:

1. Create a public repository named exactly like your username (`your-user/your-user`) with a README.
2. Add `.github/workflows/snake.yml`:

```yaml
name: GitHub Snake

on:
  schedule:
    - cron: "0 0 * * *"   # every day at midnight (UTC)
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Generate Snake SVG
        uses: luisrodriguez-rgb/GITHUB_SNAKE.EXE@v2
        with:
          github_user_name: YOUR_USER
          outputs: |
            dist/github-snake.svg?theme=light
            dist/github-snake-dark.svg?theme=dark

      - name: Deploy to Output Branch
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

3. Run it once from **Actions → GitHub Snake → Run workflow**.
4. Add this to your profile README:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/github-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/github-snake.svg">
  <img alt="GITHUB_SNAKE.EXE contribution animation" src="https://raw.githubusercontent.com/YOUR_USER/YOUR_USER/output/github-snake.svg" width="100%">
</picture>
```

### Action options

Each line of `outputs` is a `.svg` path followed by optional query-string options:

| Option | Values | Default |
| :--- | :--- | :--- |
| `theme` | `dark`, `light`, `cyberpunk`, `neon_cyan`, `amber_terminal` | `dark` |
| `speed` | `normal`, `fast`, `relaxed` | `normal` |
| `morph` | `matrix_viper`, `capsule`, `retro` | `matrix_viper` |
| `pause` | `fast`, `medium`, `none` | `fast` |

Example: `dist/snake-neon.svg?theme=neon_cyan&speed=fast&morph=capsule`.

The Action reads your calendar from GitHub's official GraphQL API, so the grid matches your profile exactly. If it can't read real data it fails with a clear error instead of drawing a fake grid. Invalid options fail the run and list the valid values.

### Alternative: direct link, no workflow (SVG endpoint)

The repo ships a serverless function ([`server/snake-svg.js`](server/snake-svg.js)) that renders the SVG on the fly with the same engine. A public instance runs at `https://github-snake-ebon.vercel.app`; just paste this into your README:

```html
<img src="https://github-snake-ebon.vercel.app/api/YOUR_USER.svg?theme=cyberpunk&morph=capsule" width="100%">
```

It takes the same options as the Action (`theme`, `speed`, `morph`, `pause`). The same deployment also serves `/api/calendar/<user>.json` (official GitHub data, CDN-cached), which the site uses instead of the third-party API, falling back to it if needed. On errors it returns an SVG that says what went wrong (unknown user, invalid option...) instead of a broken image.

**Deploy your own instance on Vercel (free Hobby plan):**
1. Import this repository at [vercel.com/new](https://vercel.com/new) (framework: *Other*, no build command).
2. Create a GitHub token: *Settings → Developer settings → Fine-grained tokens*, with **no permissions** (it only reads public data).
3. In Vercel, add it as the `GITHUB_TOKEN` environment variable and deploy.
4. Try `https://YOUR-PROJECT.vercel.app/api/YOUR_USER.svg?theme=dark`.
5. To offer the **Direct link** option on the site, set that base URL in `<meta name="snake-api" content="...">` in `index.html`.

Each SVG is cached for 6 hours on the CDN (4 hours in GitHub's image proxy) per user and option set, served brotli-compressed (~10x smaller), and each user's calendar is reused from memory for 30 minutes, so the token barely touches its API quota. Site visits on the Vercel domain redirect to GitHub Pages so pages don't eat the quota. Cloudflare Workers isn't used because rendering an SVG takes ~25–50 ms of CPU and its free plan allows 10 ms.

---

## How it works

* **Pathfinding**: BFS to the nearest commit cell (ties go to the highest intensity), plus a Flood Fill lookahead that rejects moves leaving less free space than the snake needs. Measured at a 0.006 ms median and 0.02 ms p95 per tick (Node.js, 12,000 ticks over 4 grids), using numeric cell indices and typed arrays.
* **Rendering**: logic ticks (1–9 per second) are decoupled from the 60 FPS render loop and interpolated with LERP.
* **SVG export**: the same simulation runs until the grid is empty; cells fade level by level and every snake segment shares a single keyframe path with a per-segment delay, keeping files around 45–120 KB (3–10 KB with brotli) and ~25–50 ms of CPU to render.
* **Grid geometry**: 53 Sunday-start weeks × 7 days in local time, with the current week in the last column — the same layout as GitHub.

---

## Run locally

```bash
git clone https://github.com/luisrodriguez-rgb/GITHUB_SNAKE.EXE.git
cd GITHUB_SNAKE.EXE
python3 -m http.server 3000   # or: npx serve .
```

Open `http://localhost:3000`. Tests (no dependencies): `node --test tests/*.test.js`.

When you change CSS or JS, bump the `?v=` value in `index.html` (the same value on every tag) so browsers don't mix new HTML with cached assets.

---

## License

MIT.
