# Swinburne Virtual Universe Brand and Style Guide

**Version:** 1.0  
**Source of truth:** The homepage implementation in [`index.html`](index.html), [`base.css`](base.css), [`index.css`](index.css), and [`footer.css`](footer.css)
**Purpose:** Keep all new pages visually and behaviourally consistent with the homepage.

This guide documents the system visible on the homepage. Where the source shows a pattern but does not formally name it, this guide turns that pattern into a reusable rule. It does not use the later CSS block labelled “Service page foundations” to define the brand.

---

## 1. Brand character

The Swinburne Virtual Universe website should feel:

- **Immersive:** large-format imagery and video should make the experience feel spatial and immediate.
- **Scientific:** copy should be clear, credible, precise, and grounded in real technology and data.
- **Cinematic:** layouts should use scale, contrast, pacing, and photography rather than decorative effects.
- **Contemporary:** typography is light, layouts are editorial, and controls are minimal.
- **Confident:** use short statements, generous space, and a restrained palette.
- **Institutional but not corporate:** the design should feel authoritative without becoming dense, conventional, or overly branded.

A useful shorthand is:

> A dark, cinematic, editorial science experience with precise typography and stark, square-edged controls.

### Design principles

1. **Let content and imagery create the drama.** Do not manufacture visual interest with shadows, gradients, rounded cards, or ornamental effects.
2. **Use scale instead of decoration.** Large type, full-width media, strong cropping, and deliberate negative space are the main visual tools.
3. **Stay monochrome.** The interface uses near-black, charcoal, greys, and white. Photography provides the colour.
4. **Keep geometry rectilinear.** Panels, images, buttons, fields, and containers have square corners.
5. **Animate with purpose.** Motion may reveal content, communicate a state change, or confirm interactivity. Static content should remain static on hover.

---

## 2. Non-negotiable visual rules

These rules should be applied to every new page:

- Do not use drop shadows, inset shadows, glows, or floating-card effects.
- Do not use rounded corners. Use `border-radius: 0`.
- Do not add hover animation to non-clickable elements.
- Do not make an element look clickable unless it performs an action.
- Do not add decorative accent colours. Use the established neutral palette.
- Do not use gradients as decoration. A dark image overlay is acceptable only when it protects text legibility or blends media into the page background.
- Do not place content inside generic “cards” by default. First consider an open editorial layout, a divided grid, or a flat charcoal panel.
- Do not use heavy or bold type for emphasis. Create hierarchy through size, position, spacing, and contrast.
- Do not introduce extra typefaces. Use the active homepage family.
- Do not crop key image content carelessly. Use `object-fit: cover` with a deliberate `object-position`.
- Do not hide keyboard focus indicators.
- Do not rely on motion to communicate essential information.

---

## 3. Colour system

The interface is deliberately neutral. Large photographs and video are the only rich-colour elements.

| Role | Value | Homepage use | Guidance |
|---|---:|---|---|
| Page background / near-black green | `#030705` | `html`, `body`, overlays, header tint | Primary canvas for every page |
| Primary text / white | `#FFFFFF` | Headings, body copy, links, icons, focus outlines | Default foreground on dark backgrounds |
| Primary panel / charcoal | `#1C1C1C` | Statistic panels, caption panel, button icon cell | Use for flat content panels and control fills |
| Strong divider grey | `#333333` | Footer top rule | Use sparingly for strong structural separation |
| Muted label grey | `#555555` | “About” section label | Restrict to large, non-essential labels; do not use for small body copy |
| Disabled / unavailable grey | `#777777` | Muted footer item | Use only for visibly unavailable or secondary content |
| Fine translucent divider | `rgba(255, 255, 255, 0.14)` | Header bottom rule | Use for subtle separators on the dark canvas |
| Header glass tint | `rgba(3, 7, 5, 0.88)` | Sticky header | Keeps navigation readable over page content |

### Colour usage rules

- Default to white text on `#030705`.
- Use `#1C1C1C` to group related information without lifting it off the page.
- Use borders and spacing—not shadows—to define boundaries.
- Use muted grey only when the information is genuinely secondary.
- Preserve strong contrast for all actionable text and essential content.
- Do not assign a different colour to each content category.
- Do not introduce a “brand accent” unless the homepage is intentionally redesigned first.

### Recommended shared tokens

The current CSS uses literal values in several places. New pages should refer to semantic tokens so that the same palette remains consistent:

```css
:root {
    --color-bg: #030705;
    --color-text: #ffffff;
    --color-panel: #1c1c1c;
    --color-divider-strong: #333333;
    --color-label-muted: #555555;
    --color-disabled: #777777;
    --color-divider: rgba(255, 255, 255, 0.14);
    --color-header: rgba(3, 7, 5, 0.88);
}
```

---

## 4. Typography

### Typeface

**Primary and only active typeface:** `Funnel Display`

```css
font-family: "Funnel Display", sans-serif;
```

The homepage imports three Google Font families:

- Funnel Display, variable weights `300–800`
- Manrope, variable weights `200–800`
- Special Gothic Expanded One

Only **Funnel Display** is actually applied in the homepage source. Manrope and Special Gothic Expanded One should be treated as unused—not as approved secondary faces.

### Font weights

The visual system uses **weight 300** throughout:

```css
font-weight: 300;
```

This applies to headings, paragraphs, links, navigation, and the large footer acronym. Do not use bold weight as a shortcut for hierarchy. If a small interface label needs additional clarity, improve its size, spacing, or contrast before increasing its weight.

### Type scale

The homepage establishes the following desktop scale:

| Role | CSS size | Approximate size at a 16px root | Line height |
|---|---:|---:|---:|
| Body / primary link | `1.25em` | `20px` | `1.4` body; `1.2–1.25` in controls |
| Default heading | `2em` | `32px` | `1` |
| Large section statement | `3.5em` | `56px` | `1–1.2` |
| Hero / closing statement | `4em` | `64px` | `1` |
| Footer acronym | `15em` | `240px` | `0.9` |
| Image caption token | `1em` | `16px` | Follow context |
| Navigation | `1rem` | `16px` | `1.2` |

At widths of `900px` and below:

- Main text changes to `1.1em`.
- Default heading text changes to `1.75em`.
- Hero heading uses `clamp(3.2rem, 9vw, 5rem)`.
- Large About text uses `clamp(2.5rem, 6vw, 4rem)`.

At widths of `640px` and below:

- Large service-style titles use `clamp(2.5rem, 12vw, 4rem)`.
- Closing statements use `clamp(2.8rem, 12vw, 4rem)`.
- Long display lines wrap naturally and align left.

### Typographic behaviour

- Use tight line heights for display text: approximately `0.9–1.2`.
- Use `1.4` for paragraphs.
- Keep letter spacing at the typeface default; the homepage does not add tracking to its main type.
- Use sentence case for headings and actions.
- Avoid all caps for primary headings.
- Keep introductory paragraphs to a readable measure; the hero copy is capped at `35em`.
- Very large type may be intentionally short and architectural.
- Avoid justified text on narrow screens. The homepage switches its justified About statement back to left alignment on mobile.

---

## 5. Layout system

### Overall composition

The homepage uses a full-width, editorial layout rather than a centred boxed container. New pages should use the viewport confidently while protecting content with consistent edge padding.

| Context | Horizontal padding | Typical vertical padding |
|---|---:|---:|
| Desktop section | `2vw` | `10vh` top and bottom |
| Desktop footer | `2.5vw` | `10vh` top |
| Tablet header | `3vw` | Compact header padding |
| Mobile section and footer | `5vw` | Preserve generous vertical rhythm |

### Spacing character

Spacing is fluid and tied to the viewport:

- `1vw`: tight grid gutters between related panels or media.
- `2vw`: standard media split and section edge relationship.
- `3vw`: component interior padding and larger control gaps.
- `5vw`: major column separation.
- `3–5vh`: internal vertical spacing.
- `10vh`: major section spacing.

Do not turn every gap into the same fixed pixel value. The design depends on a combination of tight internal gutters and large pauses between narrative sections.

### Preferred structures

- Asymmetrical two-column editorial splits.
- Full-bleed or near-full-width hero media.
- Large media paired with a narrower caption or information column.
- Modular statistic grids made from square-edged charcoal panels.
- Oversized closing statements over full-viewport imagery.
- Long, low-density page sections with one clear narrative purpose each.

### Section rhythm

A typical page should move through:

1. Sticky global header.
2. Large title and short introduction.
3. Dominant image or video.
4. Alternating editorial sections.
5. Flat information or statistics grid where needed.
6. Image-led closing call to action.
7. Global footer.

This is a rhythm, not a compulsory template. New pages should vary composition while retaining the same scale, palette, spacing, and geometry.

---

## 6. Header and navigation

### Header specification

- Sticky at the top of the viewport.
- Full width with `z-index: 100`.
- Minimum desktop height: `5.5rem`.
- Desktop inner padding: `0.8rem 2vw`.
- Background: `rgba(3, 7, 5, 0.88)`.
- Backdrop blur: `18px`.
- Bottom border: `1px solid rgba(255, 255, 255, 0.14)`.
- No shadow.
- Logo size: `3.35rem × 3.35rem` on desktop.

### Navigation behaviour

- Right aligned on desktop.
- Single-line labels with fluid gaps using `clamp(1.25rem, 2.6vw, 3rem)`.
- White, `1rem`, weight 300.
- The current page has a persistent one-pixel underline.
- Hover and keyboard focus reveal the same underline from left to right.
- Only links animate.

At `900px` and below, navigation becomes horizontally scrollable. At `640px` and below, the header becomes a two-row stack with the brand above the navigation.

---

## 7. Buttons and interactive controls

### Primary split button

The signature action is a rectangular, two-part control:

1. A text cell with a transparent dark-page background.
2. A square-ended icon cell filled with charcoal.

Desktop specification:

- Text colour: white.
- Font: Funnel Display, weight 300.
- Font size: the main text token (`1.25em` desktop).
- Total cell height: `10vh`.
- Horizontal cell padding: `3vw`.
- Border: `2px solid #1C1C1C`.
- Icon-cell background: `#1C1C1C`.
- Corners: square.
- Shadow: none.
- Width: content-driven unless the layout deliberately requires a full-width control.

Mobile specification:

- Cell height: `4.3rem`.
- Horizontal padding: `1.4rem`.
- Multiple hero actions stack vertically with a `1rem` gap.

### Button directions

- **Right arrow:** move to a page, advance a carousel, or progress to a next state.
- **Left arrow:** go back or show the previous item.
- **Down arrow:** scroll to content lower on the same page.

Use the same split construction for all directions. Rotate or swap the arrow; do not create an unrelated button style.

### White outline variant

Use over photographic call-to-action sections:

- Both cells have a `2px` white outline.
- The icon cell becomes transparent.
- The internal shared border is visually consolidated.
- Text and icon stay white.

### Interaction

The homepage button repeats its text and icon inside clipped containers. On hover, the visible copy slides out while its duplicate slides in.

- Duration: `0.3s`.
- Easing: `ease`.
- Motion direction should match the arrow direction.
- Keep the effect contained within the button.
- Apply the effect on hover/focus only because the element is actionable.
- Do not apply this “rolling” treatment to headings, labels, panels, or images that are not controls.

### Semantics

- Use `<a>` when the action navigates to another URL or page position.
- Use `<button>` when the action changes the current interface.
- Never use an empty `href` as a placeholder for a button.
- Ensure every icon-only action has an accessible name.

---

## 8. Links

### Navigation and footer links

- White text with no default text decoration.
- Reveal a thin underline on hover and keyboard focus.
- Keep underline motion short: `0.25–0.3s`.
- The underline is a functional interaction cue, not decoration.
- Disabled or unavailable destinations should be plain muted text, not a clickable link.

### Inline links

The homepage does not define a separate inline-link treatment. Until one is deliberately added, use a clearly visible underline and white text so links are distinguishable without relying on colour alone.

---

## 9. Panels, cards, and dividers

### Flat panels

Use `#1C1C1C` for statistic blocks, image captions, and grouped supporting information.

- No border radius.
- No box shadow.
- Use generous padding, commonly `5vh 3vw`.
- Use flex layout to separate a heading from supporting copy vertically.
- Keep panels flush within a tight `1vw` grid.

### Dividers

- Use one- or two-pixel rules.
- Use translucent white for quiet structural lines.
- Use `#333333` when a stronger boundary is needed, as in the footer.
- Do not simulate division with shadows or gradients.

### Cards

If content must be card-like, it should still read as a flat part of the page:

- Square corners.
- Solid charcoal surface or no surface.
- Tight relationship to adjacent items.
- One clear hierarchy.
- No lift, tilt, glow, hover translation, or decorative border animation.

Only a clickable card may change on hover, and its hover state must clearly communicate the click target.

---

## 10. Images and video

### Image treatment

- Use large, high-quality photography of the space, visitors, presenters, data, or astronomical visualisations.
- Prefer immersive crops over small thumbnails.
- Images are rectangular with no rounded corners or frames.
- Use `object-fit: cover`.
- Set `object-position` deliberately when the default centre crop hides the subject.
- Use `overflow: hidden` on media containers when transition effects require clipping.
- Avoid colour filters and artificial glow effects.

### Media scale

Homepage examples establish:

- Hero video: `90vh` desktop, `65vh` tablet.
- Primary About image: `80vh` desktop, `60vh` tablet.
- Service feature image: approximately `73vh` desktop, `60vh` tablet.
- Full closing image: `100vh` desktop, `80vh` mobile.

New pages do not need to copy these heights exactly, but their key images should feel similarly substantial.

### Captions

- Place captions close to their media.
- Captions may sit in a charcoal information panel or directly over an image when contrast is protected.
- Clearly identify “Image:” when that editorial convention is useful.
- Use smaller type for utility captions; use larger copy only when the caption panel is part of the narrative.

### Video

- Use full-width, cropped video for immersive scene-setting.
- Muted looping background video is acceptable when it is decorative.
- Provide an equivalent static fallback and honour reduced-motion preferences.
- Do not use autoplay for content that includes essential audio or information.

---

## 11. Motion and hover behaviour

### Permitted motion

1. **Page-entry or scroll reveal**
   - Text may reveal vertically from a clipped line.
   - Media may fade in while scaling from approximately `1.08` to `1`.
   - Supporting blocks may fade and move upward by approximately `2.5em`.

2. **Interactive feedback**
   - Button text and arrows may slide in their action direction.
   - Navigation and footer links may draw an underline.
   - Clickable image selectors may transition to communicate the active item.

3. **Content transitions**
   - A changing feature image may use a restrained scale-and-fade transition.

### Timing

| Motion type | Duration | Easing |
|---|---:|---|
| Button / simple hover | `0.3s` | `ease` |
| Navigation underline | `0.25s` | `ease` |
| Media / block reveal | `0.8s` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Line reveal | `1.1s` | `cubic-bezier(0.22, 1, 0.36, 1)` |

### Motion rules

- Do not animate non-interactive content on hover.
- Do not add looping interface animation.
- Do not use bounce, elastic easing, spinning, or exaggerated parallax.
- Keep scale changes subtle and clipped inside their media frame.
- Motion should never change the layout or make text difficult to read.
- Provide an immediate, static state when `prefers-reduced-motion: reduce` is active.

---

## 12. Accessibility and interaction states

The homepage already establishes several important behaviours. New pages must preserve them:

- Include a “Skip to main content” link.
- Give the main content a stable target such as `id="main-content"`.
- Use a `2px` white `:focus-visible` outline with a `4px` offset.
- Mark the current navigation destination with `aria-current="page"`.
- Use descriptive alternative text for meaningful images.
- Use empty alternative text only for genuinely decorative images and icons.
- Do not communicate active, disabled, or error state through colour alone.
- Ensure action labels describe their destination or result.
- Respect `prefers-reduced-motion: reduce`.
- Keep actions large enough to tap; the homepage’s split buttons comfortably exceed minimum target sizes.
- Maintain a logical heading order even when visual sizes vary.
- Ensure content remains usable when the horizontal navigation scrolls on smaller screens.

---

## 13. Responsive behaviour

### Breakpoint: `900px`

Treat this as the main layout-collapse point:

- Hero, About media, statistics, and service layouts stack vertically.
- Hero media reduces from `90vh` to `65vh`.
- Body and default heading tokens reduce slightly.
- Navigation becomes horizontally scrollable.
- Primary media becomes full width.
- Footer content may wrap.

### Breakpoint: `640px`

Treat this as the compact mobile layout:

- Header becomes a stacked brand-and-navigation layout.
- Horizontal section padding increases proportionally to `5vw`.
- Hero buttons stack.
- Split button cells use fixed `4.3rem` height.
- Long display copy wraps and aligns left.
- Statistic rows become single-column.
- Contact copy uses the full available width.
- Footer content becomes a single column.
- Display text uses responsive `clamp()` sizes.

### Responsive principles

- Stack before content becomes cramped.
- Preserve type hierarchy; reduce scale fluidly rather than making all text small.
- Keep important media large enough to remain immersive.
- Change justified text to left-aligned when line lengths shorten.
- Never introduce horizontal page scrolling. Only the compact navigation may scroll horizontally.
- Preserve square geometry and the neutral palette at every breakpoint.

---

## 14. Content and voice

### Voice

Copy should be:

- Clear and informed.
- Curious but not whimsical.
- Inspiring without exaggeration.
- Specific about scientific data, technology, scale, and visitor experience.
- Welcoming to public, school, research, and industry audiences.

### Writing patterns

- Lead with a direct, large statement.
- Follow with a concise explanatory paragraph.
- Use concrete facts as visual anchors: dimensions, megapixels, spatial audio, real datasets.
- Prefer active language: “explore,” “experience,” “discover,” “visit,” “book,” and “enquire.”
- Use short action labels such as “Learn More,” “Browse Events,” “Book a Visit,” and “Get in Touch.”
- Keep calls to action specific to the destination.

### Avoid

- Empty futurist clichés.
- Overly playful space puns.
- Dense institutional prose.
- Unsupported superlatives.
- Excessive exclamation marks.
- Long button labels.

---

## 15. Reusable CSS foundation

The following starter block consolidates homepage values without changing their visual meaning:

```css
:root {
    --color-bg: #030705;
    --color-text: #ffffff;
    --color-panel: #1c1c1c;
    --color-divider-strong: #333333;
    --color-label-muted: #555555;
    --color-disabled: #777777;
    --color-divider: rgba(255, 255, 255, 0.14);
    --color-header: rgba(3, 7, 5, 0.88);

    --font-primary: "Funnel Display", sans-serif;
    --font-weight-light: 300;
    --text-body: 1.25em;
    --text-heading: 2em;
    --text-caption: 1em;

    --section-pad-inline: 2vw;
    --section-pad-block: 10vh;
    --grid-gap-tight: 1vw;
    --grid-gap-standard: 2vw;
    --grid-gap-wide: 5vw;

    --line-subtle: 1px solid var(--color-divider);
    --line-panel: 2px solid var(--color-panel);
    --line-light: 2px solid var(--color-text);

    --motion-fast: 0.3s ease;
    --motion-reveal: 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-primary);
    font-weight: var(--font-weight-light);
}

@media (max-width: 900px) {
    :root {
        --text-body: 1.1em;
        --text-heading: 1.75em;
    }
}

@media (max-width: 640px) {
    :root {
        --section-pad-inline: 5vw;
    }
}
```

These tokens are recommended aliases for the values already present. They should be adopted incrementally rather than used to rewrite unrelated working CSS without need.

---

## 16. Page design checklist

Before approving a new page, confirm:

### Brand and hierarchy

- Does the page feel immersive, scientific, cinematic, and restrained?
- Is Funnel Display the only active typeface?
- Is weight 300 used as the default throughout?
- Does hierarchy come from scale and spacing rather than bold type or colour?

### Colour and geometry

- Is the main background `#030705`?
- Are interface surfaces limited to the approved neutral palette?
- Are all corners square?
- Are there no shadows, glows, or floating effects?
- Is photography carrying the visual colour?

### Layout

- Does the page use full-width editorial composition and consistent viewport padding?
- Are major sections separated by space or fine rules?
- Are key images large and intentionally cropped?
- Does the layout stack cleanly at `900px` and `640px`?

### Interaction

- Do only clickable elements react on hover?
- Are links and buttons visually identifiable?
- Are action animations short and directional?
- Do link and button semantics match their behaviour?
- Is keyboard focus always visible?

### Accessibility

- Is there a skip link and a main-content target?
- Is the current page marked in navigation?
- Are meaningful images described?
- Is reduced motion supported?
- Does every state remain understandable without motion or colour alone?

### Content

- Is the main message concise and specific?
- Are calls to action direct and destination-focused?
- Is the language credible rather than over-promotional?

---

## 17. Quick “do / do not” reference

| Do | Do not |
|---|---|
| Use near-black, charcoal, white, and restrained grey | Add decorative accent colours |
| Use large editorial imagery and type | Fill space with ornamental UI |
| Use flat square-edged panels | Use rounded cards |
| Use borders and spacing for separation | Use shadows or glows |
| Animate links, buttons, and state changes | Animate static content on hover |
| Use weight 300 and scale for hierarchy | Use bold text everywhere |
| Use subtle, directional movement | Use bounce, spin, or showy parallax |
| Stack layouts cleanly on small screens | Compress desktop columns until they become cramped |
| Keep action labels direct | Use vague labels such as “Click here” |
| Let photography provide colour | Apply artificial colour effects to the interface |
