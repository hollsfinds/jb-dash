# Reel B-roll library

Background clips for the code-rendered reel pipeline (render-assets/reel-render.cjs).
The publish handoff picks a clip per card by matching tags, rotating so clips don't repeat.

## How to add footage
1. Download COMMERCIALLY-LICENSED clips (Pexels, Mixkit, Coverr are free, no attribution, business-safe).
2. Vertical 9:16, ideally 1080x1920 or larger, a few seconds each, a few MB.
3. Drop the .mp4 here and add a manifest.json entry.

## Tagging (do this LIBERALLY)
- Add MANY tags per clip: the mood, the setting, the vibe, the audience, the theme.
  e.g. a woman at a laptop = ["work","laptop","business","hustle","office-casual","home-office","general"].
- More tags = easier for the pipeline to find a good match.
- Add the "general" tag to any clip that is neutral/versatile (a desk, hands, coffee, home).
  These are the FALLBACK pool when a card has no specific match, so there's always a sensible pick
  instead of a random one. Aim to keep several "general" clips in the library.
- Themes the dash uses (good tags to mirror): money, habits, home, organizing, planning; plus
  mom, business, wfh, coffee, cozy, outdoors, style.

## Rotation
- Each entry has a "last_used" field (date or null). The pipeline prefers the least-recently-used
  matching clip and updates last_used after picking, so the same clip is not used every day/week.

## Manifest entry shape
{ "file": "name.mp4", "tags": ["..."], "last_used": null, "source": "...", "license": "confirm commercial rights" }

## Do NOT
- Rip footage out of purchased Canva templates (licensing gray zone).
- Commit huge files (keep clips small; move to Git LFS / a jb-broll repo if the library grows).
