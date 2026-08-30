---
name: KSIA Infrastructure Intelligence Hub
description: Committee decision intelligence for King Salman International Airport regional infrastructure readiness
colors:
  ey-yellow: "#FFE600"
  ey-yellow-dim: "rgba(255, 230, 0, 0.15)"
  ey-yellow-hover: "#FFD000"
  dark-void: "#0D0D14"
  dark-deep: "#13131D"
  dark-panel: "#181825"
  dark-card: "#1E1E2E"
  dark-card-hover: "#252538"
  light-surface: "#F5F5F8"
  white: "#FFFFFF"
  text-primary: "#FFFFFF"
  text-muted: "#B0B0C4"
  text-dim: "#8585A0"
  text-dark: "#1A1A2E"
  border-dark: "rgba(255, 255, 255, 0.06)"
  border-light: "rgba(255, 255, 255, 0.1)"
  status-ready: "#00C48C"
  status-conditional: "#FFAA00"
  status-at-risk: "#FF5C5C"
  status-blocked: "#E63946"
  status-not-assessed: "#7575A0"
  status-in-progress: "#4DA6FF"
typography:
  display:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-1px"
  headline:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13.5px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.8px"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ey-yellow}"
    textColor: "{colors.dark-void}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.ey-yellow-hover}"
    textColor: "{colors.dark-void}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    size: "32px"
  card-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.md}"
    padding: "16px"
  card-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "20px"
  input-default:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  chip-suggestion:
    backgroundColor: "#F0F0F5"
    textColor: "{colors.text-dark}"
    rounded: "20px"
    padding: "8px 16px"
  chip-suggestion-hover:
    backgroundColor: "{colors.ey-yellow-dim}"
    textColor: "{colors.text-dark}"
    rounded: "20px"
    padding: "8px 16px"
  status-badge:
    rounded: "10px"
    padding: "2px 8px"
---

# Design System: KSIA Infrastructure Intelligence Hub

## Overview

**Creative North Star: "The Infrastructure Observatory"**

This system is an elevated vantage point over a living mega-airport city. The user looks down from a command-level altitude — dark intelligence panels serve as monitoring instruments reading vital signs across infrastructure streams, while crisp white cards on a light surface present prepared analysis and decision dossiers. EY yellow (`#FFE600`) functions as the observatory's signal lamp: it marks what demands attention, what requires action, and where the critical path runs. It never decorates.

The dual-context architecture — dark panels for real-time monitoring, light cards for structured analysis — mirrors how infrastructure committee members actually work: scanning for anomalies first, then drilling into specifics. The approved KSIA aerial image grounds every session in the physical reality of the site, serving as both spatial reference and the theater of operations.

**Key Characteristics:**
- **Dual-context surfaces**: dark panels (monitoring/intelligence) and light cards (analysis/action) coexist on a neutral light-grey canvas
- **Signal-driven accent**: EY yellow is used sparingly as a functional signal, never as fill or decoration
- **Status-first information design**: readiness and project statuses are communicated through a consistent six-color vocabulary with both color and text
- **Institutional density**: compact typography, tight spacing, and data-rich layouts built for committee-room projection
- **Restrained motion**: transitions exist to confirm interaction (0.15s), not to entertain

## Colors

The palette operates across two distinct contexts — a dark monitoring environment and a light analytical surface — unified by a single accent signal.

### Primary
- **EY Signal Yellow** (`#FFE600`): The only accent color in the entire system. Used for panel titles, active indicators, hover borders, CTA buttons, and the hero action. Its rarity is the point — when yellow appears, it means "act here." Hover state deepens to `#FFD000`.

### Neutral — Dark Context
- **Void Black** (`#0D0D14`): Header and deepest backgrounds. The absolute floor of the tonal stack.
- **Deep Charcoal** (`#13131D`): Secondary dark surfaces for layered depth.
- **Panel Slate** (`#181825`): Intelligence panel backgrounds — the primary dark working surface.
- **Card Indigo** (`#1E1E2E`): Elevated dark cards within panels.
- **Hover Indigo** (`#252538`): Dark card hover state.

### Neutral — Light Context
- **Cool Surface** (`#F5F5F8`): Body background. The neutral canvas that all light cards sit on.
- **Pure White** (`#FFFFFF`): Card, milestone, and module backgrounds. Maximum contrast against the surface.
- **Suggestion Grey** (`#F0F0F5`): Chip and secondary interactive element resting state.

### Neutral — Text
- **White** (`#FFFFFF`): Primary text on dark surfaces.
- **Muted Lavender** (`#B0B0C4`): Secondary text on dark surfaces — descriptions, metadata.
- **Dim Grey** (`#8585A0`): Tertiary text on dark surfaces — the lowest readable level.
- **Ink Navy** (`#1A1A2E`): Primary text on light surfaces — body copy, card titles.

### Neutral — Borders
- **Whisper Border** (`rgba(255, 255, 255, 0.06)`): Default dark-context dividers.
- **Soft Border** (`rgba(255, 255, 255, 0.1)`): Emphasized dark-context borders.
- **Light Card Border** (`rgba(0, 0, 0, 0.04)`): Card edges on the light surface.
- **Divider Grey** (`#E0E0EA`): Footer and input borders on light surfaces.

### Status Vocabulary
- **Ready / On Track** (`#00C48C`): Green — sufficient capacity, on schedule.
- **Conditional / Pending** (`#FFAA00`): Amber — prerequisites remain or action awaited.
- **At Risk / Overdue** (`#FF5C5C`): Red — may miss target date.
- **Blocked** (`#E63946`): Deep red — confirmed critical impediment.
- **Not Assessed** (`#7575A0`): Muted — no evaluation performed.
- **In Progress** (`#4DA6FF`): Blue — active work underway.

### Named Rules
**The Signal Lamp Rule.** EY yellow appears on no more than 5-10% of any screen's surface area. It marks action points, active states, and panel identifiers — never backgrounds, fills, or decorative borders. Its power comes from scarcity.

**The Six-Status Rule.** Every status in the system maps to exactly one of six colors. No gradients, no opacity variations for status meaning. Status is always communicated through color AND a text label together.

## Typography

**Primary Font:** Inter (with -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif fallback)

**Character:** Inter carries the full weight range (300–800) and serves every role — from 26px 800-weight dashboard counters to 9.5px 600-weight table headers. The system relies on weight and size contrast within a single family rather than pairing. This gives it a technical, institutional feel — like an infrastructure monitoring console rather than a magazine.

### Hierarchy
- **Display** (800, 26px, line-height 1.2, letter-spacing -1px): Executive card values — the large numbers that anchor dashboard scanning. Tight tracking compresses wide numerals.
- **Headline** (700, 22px, line-height 1.25): Hero title and primary section headings. Only appears once or twice per screen.
- **Title** (700, 13.5px, line-height 1.4): Module card titles, panel sub-headings, milestone labels. The workhorse heading level.
- **Body** (400, 14px base / 12px hero body / 11.5px descriptions, line-height 1.5–1.6): Paragraph text and descriptions. The base font size is 14px on `html`.
- **Label** (600–700, 9.5–12px, letter-spacing 0.3–0.8px, uppercase): Section titles, panel headers, table headers, tags. Always uppercase with tracked spacing. EY yellow when on dark panels, `--text-tertiary` when structural.

### Named Rules
**The Uppercase Authority Rule.** Section-level labels and panel titles are always uppercase with positive letter-spacing (0.5–0.8px). This separates navigational/structural text from content text at a glance.

**The Weight-Not-Size Rule.** Within a single context (a card, a panel), hierarchy is established primarily through weight changes (400 → 600 → 700) before reaching for size changes. This keeps density high without inflating the layout.

## Layout

The system uses a constrained single-column layout with a `max-width: 1400px` centered container. The sticky header (52px) anchors all views.

**Grid patterns:**
- Intelligence panels: `repeat(4, 1fr)` with `--space-lg` (24px) gap
- Module cards: `repeat(4, 1fr)` with `--space-lg` gap
- Hero section: `1.1fr 0.9fr` asymmetric split
- Executive indicators: `auto repeat(5, 1fr)` — readiness gauge leads, five metric cards follow

**Spacing rhythm:** Built on the `--space-*` scale (4 / 8 / 16 / 24 / 32 / 48px). Internal card padding is `--space-md` (16px) for light cards, 20px for dark panels. Section gaps use `--space-lg` to `--space-2xl`.

**Responsive collapse:**
- At 1200px: 4-column grids become 2-column; executive indicators reflow to 3-per-row
- At 768px: hero stacks vertically; all grids become single-column; header filters hide behind a toggle

**Density:** The system runs dense — 11–13.5px body text, 8–16px internal padding, tight row spacing. This is intentional for committee-room projection where scanning speed matters more than reading comfort.

## Elevation & Depth

The system uses a mixed depth model: **tonal layering on dark surfaces, subtle shadows on light surfaces.**

Dark panels never use box-shadow. Depth is communicated through the four-step tonal ramp: Void (`#0D0D14`) → Deep (`#13131D`) → Panel (`#181825`) → Card (`#1E1E2E`). Each step is perceptible but restrained — roughly 8-10 lightness units apart. Borders at `rgba(255, 255, 255, 0.06)` provide edge definition without breaking the tonal flow.

Light cards use minimal ambient shadow: `0 1px 3px rgba(0,0,0,0.04)` at rest. On hover, module cards lift to `0 8px 24px rgba(0,0,0,0.08)` with a `translateY(-2px)` — the only time elevation physically changes. Status dots (Critical, High) carry colored glows (`0 0 6px`) as urgency signals, not depth cues.

### Named Rules
**The Tonal Ramp Rule.** On dark surfaces, depth is always conveyed through background-color steps, never shadows. Adding a shadow to a dark panel breaks the observatory instrument aesthetic.

**The Lift-on-Intent Rule.** Light cards gain elevation only on hover — the user's intent to interact triggers the lift. Cards at rest are nearly flush with the surface.

## Shapes

The form language is **gently rounded, never circular** (except avatars and status dots). Three radius steps cover all cases:

- **Small** (`6px`): Buttons, inputs, filters, icon buttons — interactive elements that need to feel tappable but precise.
- **Medium** (`10px`): Cards, panels, milestones, badges — container elements that group content. The default for any new surface.
- **Large** (`16px`): The hero image wrapper only. Reserved for the single largest visual element on the page.

Specialty radii exist for pills (`20px` on suggestion chips, `10px` on status badges) and full circles (`50%` on avatars and action dots). Progress bars use `3–4px` to stay sharp at their small height (5–7px).

Borders are structural, not decorative: `1px solid` at low opacity on dark contexts, `rgba(0,0,0,0.04)` on light cards. The only decorative border is the `3px` left-side EY yellow accent strip that appears on module card hover — a controlled reveal of brand presence.

## Components

### Buttons
- **Shape:** Gently rounded corners (`6px`)
- **Primary (CTA):** EY yellow background, dark-void text, 700 weight, `10px 20px` padding. Hover deepens to `#FFD000` with `translateY(-1px)`.
- **Icon Button:** 32×32px transparent square, `6px` radius. Hover fills with `rgba(255,255,255,0.06)`. Icon color is `--text-muted`.
- **Send Button:** 36×36px dark-void background, centered SVG in EY yellow. Hover darkens to `#2a2a3a`.

### Chips
- **Style:** Pill-shaped (`border-radius: 20px`), `#F0F0F5` background, dark text, `8px 16px` padding.
- **State:** Hover shifts background to `--ey-yellow-dim` (`rgba(255, 230, 0, 0.15)`). No selected/active variant currently defined.

### Cards / Containers
- **Light Cards:** White background, `1px solid rgba(0,0,0,0.04)`, `--radius-md` (10px), `0 1px 3px rgba(0,0,0,0.04)` shadow, `--space-md` (16px) padding.
- **Module Cards:** Light card base with a hidden `3px` EY yellow left accent strip (opacity 0 → 1 on hover). Hover lifts (`translateY(-2px)`), strengthens shadow, adds `rgba(255,230,0,0.3)` border.
- **Dark Panels:** `--bg-panel` (`#181825`) background, `1px solid --border-dark`, `--radius-md`, 20px padding. Panel title in EY yellow uppercase label style. Footer separator with EY yellow "View Details →" link.

### Inputs / Fields
- **Style:** White background, `1px solid #E0E0EA`, `--radius-sm` (6px), `10px 14px` padding.
- **Focus:** Border transitions to `--ey-yellow` over 0.15s.
- **Placeholder:** `#B0B0C0` color.

### Navigation (Header)
- **Style:** 52px sticky dark header. Logo mark (EY badge) + `1px` vertical divider + centered filter selects + divider + right-side icon actions.
- **Filter selects:** Dark transparent background (`rgba(255,255,255,0.04)`), white text, `--radius-sm`. Focus border becomes EY yellow.
- **Icon buttons:** 32×32px, `--text-muted` color, subtle hover fill.

### Status Badges
- **Style:** Inline pills with `2px 8px` padding, `border-radius: 10px`. Background is the status color at 15% opacity, text is the full status color. Font: 9px 600 weight uppercase.

### Progress Bars (Signature Component)
- **Dark context track:** `rgba(255,255,255,0.06)` background, `border-radius: 3px`, height 5px (streams) or 7px (prerequisites).
- **Fill:** Status-colored, animated with `width 1s cubic-bezier(0.4, 0, 0.2, 1)`. The cubic-bezier easing gives a satisfying deceleration.
- **Gauge (executive):** SVG circle with `stroke-dashoffset` animation at `1.2s cubic-bezier(0.4, 0, 0.2, 1)`. Track stroke `#E8E8F0`, fill stroke status-colored.

### Milestones
- **Style:** White card, `3px` left border color-coded by readiness status. `min-width: 155px`, horizontal scroll container. Hover lifts with `translateY(-1px)`.

## Do's and Don'ts

### Do:
- **Do** use EY yellow exclusively for interactive signals: CTA buttons, active states, panel titles, hover accents, and the hero action. It must always mean "act here" or "look here."
- **Do** communicate every status through both color and text label simultaneously. Never rely on color alone.
- **Do** maintain the tonal ramp on dark surfaces (Void → Deep → Panel → Card). Each step should be perceptibly but subtly lighter.
- **Do** use uppercase + letter-spacing (0.5–0.8px) for all structural labels and section titles. This is the system's consistent navigational signal.
- **Do** keep transition durations at 0.15s for micro-interactions (hover, focus) and reserve longer durations (1–1.2s) for data visualizations (bar fills, gauge animations).

### Don't:
- **Don't** use EY yellow as a background fill, gradient component, or decorative border. It is a signal, not a surface.
- **Don't** add box-shadows to dark-context panels or cards. Depth on dark surfaces comes from tonal stepping only.
- **Don't** introduce a second accent color. The system's authority comes from yellow-against-dark/white contrast. A second hue dilutes the signal.
- **Don't** exceed `--radius-lg` (16px) on any element. The system's form language is gently rounded, never bubbly or circular (except designated avatars/dots).
- **Don't** use font sizes below 9px or above 26px. The density model depends on a compressed but legible range.
