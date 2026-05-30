# Iconography

**Library:** [Lucide](https://lucide.dev) — used via the `lucide` web component / SVG sprite.

> ⚠️ **Substitution flag.** No icon set was supplied with the brand brief. Lucide is the canonical pairing for shadcn-based products; if BetterAgent has its own icon set, swap it in.

## Defaults

| Prop | Value |
|------|-------|
| Stroke width | `1.5` (override Lucide's default 2) |
| Color | `currentColor` |
| Sizes | 14 / 16 / 20 / 24 — never 18 or 22 |

## Usage by surface

- **Tables, inline badges, dense lists** → 14px
- **Buttons, form inputs, dropdown items** → 16px
- **Section headers, card titles, nav items** → 20px
- **Empty states, hero illustrations, large CTAs** → 24px

## Pairing

| Context | Gap (icon → label) |
|---|---|
| Buttons | 6px |
| Nav items | 8px |
| Card headers, marketing | 12px |

## Allowed unicode (no emoji)

`→ ↗ … · ✓ ✕`  — only `·` and `→` appear in the web UI; `✓ ✕` are CLI-only.

## Common icon names (Lucide)

| Use | Icon |
|---|---|
| Agent thinking | `loader-2` (spin), but prefer the brand 3-dots indicator |
| Tool call | `terminal` |
| Run / dispatch | `play` |
| Override / stop | `square` |
| Run history | `history` |
| Logs | `file-text` |
| API key | `key-round` |
| Webhook | `webhook` |
| Copy | `copy` |
| External link | `arrow-up-right` |
| Sidebar collapse | `panel-left` |
| Theme toggle | `sun` / `moon` |
