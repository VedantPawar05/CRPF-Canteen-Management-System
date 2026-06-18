# Design System Specification: Editorial Tactility

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Industrial Atelier."** 

This system rejects the "flatness" of modern SaaS templates in favor of a bespoke, high-end editorial experience. It combines the raw, utilitarian structure of industrial blueprints with the refined depth of premium digital craftsmanship. By leaning into intentional asymmetry, large-scale typography, and layered tonal surfaces, we move beyond generic interfaces to create a workspace that feels physically manufactured and intellectually curated.

We break the "template" look by using exaggerated breathing room, unconventional component placement (e.g., labels offset from their inputs), and a tactile depth model that mimics the physical world without descending into dated skeuomorphism.

---

## 2. Colors & Surface Architecture
The palette is a sophisticated monochromatic base with high-chroma "Tactile Accents" (Primary Orange and Tertiary Teal) to draw the eye to critical actions.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be achieved exclusively through:
- **Tonal Shifts:** Placing a `surface-container-low` section against a `background` base.
- **Negative Space:** Using the spacing scale to create psychological boundaries.
- **Tactile Shadows:** Using inset or outset shadows to imply a physical break in the material.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. Each layer "elevates" by shifting its token:
1.  **Base Layer:** `surface` (#0e0e12)
2.  **Sectional Layer:** `surface-container-low` (#131318)
3.  **Component Layer (Cards/Inputs):** `surface-container` (#191920)
4.  **Floating/Active Layer:** `surface-container-highest` (#24252f)

### The "Glass & Gradient" Rule
For floating elements (modals, dropdowns), use `surface-container-highest` with a 80% opacity and a `24px` backdrop-blur. To add "soul," apply a subtle linear gradient to Primary CTAs—transitioning from `primary` (#ffb690) to `primary-container` (#783200) at a 45-degree angle. This prevents buttons from looking like "flat stickers" and gives them a machined finish.

---

## 3. Typography: Modern Editorial
We use **Plus Jakarta Sans** as the sole typeface. Its geometric clarity provides the "Industrial" look, while the exaggerated scale provides the "Editorial" feel.

- **Display (lg/md/sm):** Used for "Hero" moments. Use `tight` letter-spacing (-0.02em) to create a high-impact, headline-driven layout.
- **Headline (lg/md/sm):** Reserved for section starts. Place these asymmetrically (e.g., far left with content shifted right) to break the grid.
- **Body (lg/md/sm):** For readability. Ensure `body-lg` is used for introductory paragraphs to maintain the premium feel.
- **Labels (md/sm):** These are our "Metadata" layer. Always use `on-surface-variant` (#aaaab7) to provide a clear contrast between content and descriptors.

---

## 4. Elevation & Depth
Depth is not an afterthought; it is the primary navigation tool.

### The Layering Principle
Instead of shadows, use the **Tonal Stack**. A `surface-container-lowest` (#000000) card sitting on a `surface-container` (#191920) background creates an "inset" effect, making the card feel carved into the UI.

### Ambient Shadows
When a "floating" effect is required (e.g., a primary action button or a modal):
- **Blur:** 32px to 64px.
- **Opacity:** 6% - 10%.
- **Color:** Use a tinted shadow (`#000000` mixed with 5% of `primary`). This mimics real-world ambient occlusion.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input states), use the `outline-variant` (#464753) at **15% opacity**. Never use 100% opaque borders; they disrupt the "Industrial Atelier" flow.

---

## 5. Components

### Buttons (Tactile Machining)
- **Primary:** Gradient from `primary` to `primary-container`. `0.5rem` (lg) roundedness. Use an outset shadow (2px vertical) to make it feel "pressed" on hover.
- **Secondary:** `surface-container-highest` background with a "Ghost Border."
- **Tertiary:** Text-only using `primary-dim` (#ffa270), no container.

### Input Fields (Carved Experience)
Forbid traditional boxes. Use an "inset" shadow style:
- **Background:** `surface-container-low`.
- **Inner Shadow:** `0 2px 4px rgba(0,0,0,0.4)` to make the field feel recessed into the dashboard.
- **Focus State:** Transition the "Ghost Border" to 40% opacity of `primary-fixed-dim`.

### Cards & Lists (The Blueprint Layout)
- **Rules:** No dividers. Use a 24px vertical gap between list items. 
- **Separation:** For list items, use a subtle background hover shift to `surface-bright` (#2a2b38).
- **Tactile Marks:** Add "Corner Marks" (0.5rem L-shaped lines in `outline-variant` at 20% opacity) to the four corners of high-priority cards to mimic blueprint schematics.

### Chips (Functional Tags)
Use `secondary-container` (#2d3c51) for background. Keep corners `full` (9999px) to contrast against the sharp `md` and `lg` corners of the rest of the UI.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use `display-lg` typography for empty states or dashboard greetings to establish an editorial voice.
- **Do** use "Surface Nesting" to group related data instead of using lines.
- **Do** allow elements to overlap slightly (e.g., a chip overlapping the edge of a card) to create depth.

### Don't:
- **Don't** use pure white (#ffffff) or pure grey. Always use the specified surface tokens to maintain the chromatic depth of the dark mode.
- **Don't** use standard 1px dividers. If separation is needed, use a `surface-variant` block that is only 4px wide/tall.
- **Don't** use high-opacity shadows. If the shadow is clearly visible, it is too heavy. It should be felt, not seen.