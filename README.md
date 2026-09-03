# pulsur — Mockups

Product design mockups and concepts for **pulsur**, the AI insight product of **Urban Innovate**.

> Brand split: **Urban Innovate stays light**, **pulsur is the dark, high-tech product surface.**

Open [`index.html`](index.html) for the hub linking to every mockup, or jump straight in below.

## Mockups

### Product (v2 — dark, with light toggle)

| File | What it is |
|---|---|
| [`pulsur-dashboard-v2.html`](pulsur-dashboard-v2.html) | The live product — KPI row, intelligence panel, AI insight, sentiment gauge, segments table, live signals feed, trend + theme heatmap. |
| [`pulsur-analytics-v2.html`](pulsur-analytics-v2.html) | Chart gallery — interactive trend, donuts, theme heatmap, scatter, persona radar, diverging bars, calendar activity, top phrases. |
| [`pulsur-design-system-v2.html`](pulsur-design-system-v2.html) | Living style guide — colour, type, spacing, elevation, motion, components and patterns. |

These three default to **dark** and include a **dark/light switch** (top-right). The choice persists via `localStorage` and is shared across all three pages.

### Freemium concept

| File | What it is |
|---|---|
| [`pulsur-freemium-v2.html`](pulsur-freemium-v2.html) | The free user's screen — one unlocked Pulse Report, live intelligence blurred behind frosted glass, upgrade panel. |
| [`pulsur-freemium-concept.html`](pulsur-freemium-concept.html) | The idea explained for CEO + devs — 5-step flow, free vs locked, the rules, what we build, success metrics. |

**The model:** every new user gets **exactly one full Pulse Report** for their city — real data, no credit card — then the live platform locks until they request access. It's a lead-qualification funnel, not a self-serve free tier.

### Original (v1 — light)

`pulsur-dashboard.html` · `pulsur-analytics.html` · `pulsur-design-system.html` — the first light-themed set, kept for reference.

## Design language

| Token | Value | Role |
|---|---|---|
| Teal | `#2BA0CE` | Primary actions, links |
| Green | `#7EC827` | Live / positive |
| Pulse gradient | teal → green | Signature CTA & data |
| Base (dark) | `#080F18` | App background |
| Surface (dark) | `#0C1A27` | Hero / panels |
| Type | **Sora** (display) + **Inter** (UI) | — |

Cards are glassy (white @ 5% over near-black) with ambient teal/green glow. Charts use the teal→green language throughout; sentiment is always labelled, never colour-only.

## Running

Every file is self-contained — only Google Fonts is external. Just open any `.html` in a browser, no build step.

```bash
# or serve the folder
python3 -m http.server 8000
```

## Logo

The pulsur logo lives at `assets/pulsur-logo.png` and is referenced by every page. To swap it, replace that file — keep the exact filename and all pages pick it up automatically. Pages fall back to a CSS wordmark if it's missing.

---

Mockups only — no real data. Built for Urban Innovate.
