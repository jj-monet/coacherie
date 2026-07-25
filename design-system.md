# The Coacherie — Design System

---

## Fonts

### Cormorant Garamond *(serif)*
Used for all headings, the brand logo, subheadings, quotes, and display text. Thin and elegant — the primary expressive voice of the brand.

| Weight | Style | Usage |
|--------|-------|-------|
| 300 | Normal + Italic | Nav tagline, supporting text |
| 400 | Normal + Italic | Nav logo, subheads, quotes, contact heading |
| 600 | Normal + Italic | Hero headline, section titles, service card titles, about intro |

Google Fonts import:
```
Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600
```

---

### DM Sans *(sans-serif)*
Used for all body copy, buttons, labels, eyebrows, and form fields. Clean and functional — the workhorse of the brand.

| Weight | Usage |
|--------|-------|
| 300 | Body paragraphs, form fields, reassurance text |
| 400 | Nav links, secondary buttons, labels |
| 500 | Buttons (primary), eyebrow labels |

Google Fonts import:
```
DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500
```

---

## Colors

### Brand Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--charcoal` | `#2D2A26` | 45, 42, 38 | Primary text, headings, nav logo |
| `--sienna` | `#B05A40` | 176, 90, 64 | Accent — buttons, eyebrows, emphasis, links, active states |
| `--honey` | `#8C6845` | 140, 104, 69 | Italic emphasis in subheadings |
| `--walnut` | `#8C7B72` | 140, 123, 114 | Services/corkboard section background |

### Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `--white` | `#FAF8F4` | Page background, nav, service cards, contact section |
| `--cream` | `#EDE8DF` | Hero background fallback, overlay base |
| `--linen` | `#EAE3D8` | Quote strip, about section background |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| `--text-body` | `rgba(45,42,38,0.75)` | Hero body copy, subheads |
| `--text-mid` | `rgba(45,42,38,0.58)` | Secondary body copy throughout |

### Derived / Hover States

| Value | Usage |
|-------|-------|
| `#944830` | Sienna button hover (darkened) |
| `rgba(45,42,38,0.48)` | Nav tagline |
| `rgba(45,42,38,0.55)` | Nav links |
| `rgba(45,42,38,0.40)` | Reassurance / muted text |

---

## Typography Scale

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Brand logo | Cormorant Garamond | 1.55rem | 400 | Uppercase, letter-spacing 0.30em |
| Nav tagline | Cormorant Garamond | 14px | 300 | Italic |
| Nav links | DM Sans | 11px | 400 | Uppercase, letter-spacing 0.16em |
| Eyebrow labels | DM Sans | 9.5px | 500 | Uppercase, letter-spacing 0.30em, sienna |
| Hero headline | Cormorant Garamond | clamp(28px → 64px) | 600 | Line-height 1.1 |
| Hero subhead | Cormorant Garamond | clamp(13px → 24px) | 400 | Line-height 1.55 |
| Hero body | DM Sans | clamp(11px → 15.5px) | 300 | Line-height 1.65 |
| Section heading | Cormorant Garamond | 22–26px | 600 | |
| Quote | Cormorant Garamond | clamp(20px → 28px) | 400 | Italic |
| Body copy | DM Sans | 14–16px | 300 | Line-height 1.75–1.85 |
| Button | DM Sans | 12–13px | 500 | Uppercase, letter-spacing 0.1em |
| Contact heading | Cormorant Garamond | clamp(36px → 52px) | 400 | Italic, sienna |

---

## Buttons

### Primary
- Background: `--sienna` (`#B05A40`)
- Text: `--white`
- Font: DM Sans 500, uppercase, 0.1em letter-spacing
- Padding: 16px 36px
- Border radius: 2px
- Hover: `#944830`, translateY(-1px)

### Secondary (text link)
- Color: `rgba(45,42,38,0.60)`
- Underline border: `rgba(45,42,38,0.28)`
- Font: DM Sans 400, uppercase, 0.1em letter-spacing
- Hover: `--charcoal`, border darkens

---

## Spacing & Layout

- Max content width: **1100px**
- Desktop page padding: **64px** horizontal
- Mobile page padding: **28px** horizontal
- Mobile breakpoint: **900px**
- Section vertical padding: **80–100px** desktop / **60px** mobile

---

## Voice & Tone Notes

- Warm, grounded, unhurried
- Honest without being heavy
- Speaks directly to the reader ("you"), not about them
- Tagline: *Come as you are. Leave knowing who you're becoming.*
- Emphasis words (*are*, *becoming*) styled in sienna italic
