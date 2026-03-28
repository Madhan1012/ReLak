# Design System Strategy: Technical Precision & The Drafting Table

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Architectural Engine."** 

We are moving away from the "web template" look to create a workspace that feels like a high-end CAD tool or a physical drafting table. This system celebrates the beauty of technical documentation—precision, intentionality, and structural honesty. We achieve an "engine-like" feel not through clutter, but through sophisticated layering and technical micro-details. The UI doesn't just display a portfolio; it "constructs" it. To break the standard grid, we utilize intentional asymmetry: metadata is tucked into "technical margins," and content is treated like schematics pinned to a board.

## 2. Colors & Surface Logic
The palette is rooted in the depth of `primary` (Blueprint Blue) and the neutrality of `surface` (Drafting Grey).

*   **The "No-Line" Rule:** Sectioning must never rely on 1px solid borders. Instead, define boundaries through background shifts. A `surface-container-low` area should sit atop a `surface` background to denote a module. Use the CSS grid pattern (on the `background` layer) to provide the structural "DNA" that peeks through the gaps between containers.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked vellum. 
    *   **Base Layer:** `surface` (#f9f9f9) with a 16px CSS grid pattern.
    *   **Work Zones:** `surface-container` (#eeeeee) for primary interaction areas.
    *   **Active Modules:** `surface-container-lowest` (#ffffff) for cards or focused data entry, creating a "pop" against the darker technical background.
*   **The "Glass & Gradient" Rule:** For floating panels or navigation, use a `surface-variant` with a 70% opacity and a `20px` backdrop-blur. This simulates frosted architectural tracing paper.
*   **Signature Textures:** Apply a subtle linear gradient to main Action Buttons, transitioning from `primary` (#001e40) to `primary-container` (#003366) at a 135-degree angle. This adds a "weighted" feel to the "engine's" controls.

## 3. Typography: The Engineering Lexicon
We utilize a high-contrast pairing to balance technical data with editorial readability.

*   **Display & Headlines (Space Grotesk):** Chosen for its geometric, mid-century architectural feel. Use `display-lg` for portfolio titles, ensuring they feel "engraved" into the layout.
*   **Technical Data & Labels (JetBrains Mono):** This is our "Drafting Pen." All technical metadata, button labels, and system statuses must use `label-md` or `title-sm` in JetBrains Mono. It conveys precision and a "code-first" philosophy.
*   **Body Content (Inter):** For long-form descriptions, Inter provides the necessary "clean sans-serif" neutral ground, ensuring that the technical styling of the surrounding UI doesn't fatigue the reader.

## 4. Elevation & Depth
In this system, depth is a product of tonal layering, not drop shadows.

*   **The Layering Principle:** A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural lift. This mimics sheets of paper stacked on a table.
*   **Ambient Shadows:** If an element must float (like a modal), use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(0, 30, 64, 0.05)`. The shadow is tinted with the `primary` color to maintain tonal harmony with the blueprint aesthetic.
*   **The "Ghost Border" Fallback:** For dashed "Upload Zones," use the `outline-variant` token at 20% opacity. The dashes should be 4px long with a 4px gap, reinforcing the "blueprint line" aesthetic. 
*   **Glassmorphism:** Use semi-transparent layers for sidebars to allow the underlying drafting grid to remain visible, maintaining a sense of spatial continuity.

## 5. Components
Each component should feel like a custom-machined part.

*   **Buttons:** 
    *   **Primary:** Solid `primary` with `on-primary` text in JetBrains Mono. No rounded corners beyond `sm` (0.125rem) to maintain a "sharp" technical edge.
    *   **Secondary:** `surface-container-highest` background with a "Ghost Border."
*   **Upload Zones:** Large, expansive areas using `surface-container-low` with a `primary` dashed stroke. Text within should be `label-md` (JetBrains Mono) and center-aligned like a blueprint callout.
*   **Progress Bars:** Eschew the rounded "pill" look. Use a 2px tall `primary-container` track with a `secondary` (Technical Green) fill. Add vertical tick marks every 10% to mimic an architectural scale ruler.
*   **Inputs:** Minimalist. No background fill—only a bottom border using `outline-variant`. On focus, the border transitions to `primary` and a small JetBrains Mono "Coordinate" (e.g., [01], [02]) appears in the `label-sm` style.
*   **Cards & Lists:** Prohibit dividers. Separate list items using `spacing-4` (1rem) of vertical whitespace. High-priority cards should use a subtle `secondary-container` highlight in the top-right corner as a "status flag."
*   **Technical Chips:** Use `secondary` for "Active" and `tertiary` for "Draft." These should look like small printed labels, using `label-sm` in JetBrains Mono.

## 6. Do's and Don'ts

**Do:**
*   **Do** align elements to the grid pattern strictly. If an element is off-grid, it should look intentionally asymmetrical, not accidental.
*   **Do** use JetBrains Mono for anything that feels like "system output" or "user input."
*   **Do** use the `secondary` (Technical Green) sparingly—only for successful states or "System Go" indicators.

**Don't:**
*   **Don't** use `full` (9999px) rounded corners. This is a precision tool, not a social media app. Stick to `sm` (2px) or `none`.
*   **Don't** use standard "Grey" shadows. Shadows must be ambient and tinted with the Blueprint Blue (`primary`).
*   **Don't** use 1px solid black or high-contrast borders. If you can't define a section with a background color shift, your hierarchy isn't strong enough.