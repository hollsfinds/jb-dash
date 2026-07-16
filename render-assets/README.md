# render-assets — permanent build assets for the code-rendered Cowork pin skeletons

These are the fonts, logo files, and Playwright render scripts that generate the
code-rendered pin skeletons (Type Stack s10/s11, Photo templates s12–s15, and future
skeletons). They used to be rebuilt from scratch in each session's scratch dir and lost
on session end. They live here now so any session can render immediately.

## Contents
- `fonts/` — BebasNeue-Regular.otf (headlines), Havana-Regular.otf (script),
  Poppins-SemiBold.ttf + Poppins-Medium.ttf (support), Raleway-Bold.ttf.
- `assets/` — logo_color.b64 and logo_white.b64. These are base64 TEXT files (the raw
  base64 of the Juney & Byrd wordmark PNG), read as utf8 by the render scripts.
  - logo_color = full-color wordmark on a white background (used on white/light pins).
  - logo_white = wordmark ink recolored to white with the barcode bars kept in color,
    white background made transparent (used on navy/photo pins).
- `typestack-render.cjs` — Type Stack family. `node typestack-render.cjs cfg.json out.png`.
  Flat text on white/navy. cfg.mode:'list' renders the flat TikTok page-2 slide.
- `photocard-render.cjs` — Photo family. `node photocard-render.cjs cfg.json out.png`.
  Lifestyle background + white wash overlay. cfg.style: editorial|sticker|band|stacked|list2|cardlist.

## How to use in a fresh session
1. Clone jb-dash (see the skeleton handoff).
2. `mkdir -p /tmp/mock && cp -r render-assets/* /tmp/mock/` — the scripts read
   `fonts/` and `assets/` relative to their own dir, so keep them together.
3. Backgrounds and headshots are NOT bundled here (too large / rotate by folder position).
   Stage them from the Mac when needed:
   - Photo backgrounds: "Pin Backgrounds only/"
   - Headshots: "Pin Headshots only/"
4. Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (Chromium 141, supports text-box-trim).

## Notes
- BebasNeue-Regular.otf here is the Google Fonts Bebas Neue TTF (byte-compatible for the
  data-URI @font-face; Chromium sniffs the format).
- If the logo wordmark ever changes, rebuild both .b64 from the new PNG:
  `base64 -w0 logo.png > assets/logo_color.b64` (color), and recolor to white for logo_white.
- Colors baked into the scripts: navy #22334f, coral #e8836f, mint #cdeee1, teal #2f8f7d, sage #b7d6c4.
