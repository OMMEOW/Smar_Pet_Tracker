# Design System Specification: The Kinetic Guardian

## 1. Overview & Creative North Star
This design system is built upon the North Star of **"The Kinetic Guardian."** In the world of IoT dog tracking, reliability is not just a feature—it is a visceral requirement. We move beyond standard "utility" interfaces to create a high-end editorial experience that feels like a premium Swiss timepiece: precise, quiet, and impeccably constructed.

To achieve "Apple-level simplicity," we reject the cluttered grid. Instead, we embrace **Breathing Precision**. This means using intentional asymmetry, generous white space (macro-typography), and layered depth to guide the user’s eye. The interface should not feel like a "website," but like a physical object carved from glass and light.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a spectrum of sophisticated neutrals, punctuated by high-signal functional accents.

### The "No-Line" Rule
Standard UI relies on 1px borders to define space. **This design system prohibits solid borders for sectioning.** Boundaries are defined exclusively through:
*   **Tonal Shifts:** Placing a `surface-container-high` card against a `surface` background.
*   **Shadow Depth:** Using soft, ambient light to lift an element.
*   **Negative Space:** Using the Spacing Scale to create "gutters" of air that act as invisible dividers.

### Surface Hierarchy & Nesting
We treat the UI as a series of physical layers. Use the `surface-container` tiers to create a "nested" architecture:
*   **Base:** `surface` (#f9f9fe) is the canvas.
*   **Lower Priority:** `surface-container-low` (#f3f3f8) for secondary grouping.
*   **High Priority:** `surface-container-lowest` (#ffffff) for primary interactive cards, creating a "pop" effect against the slightly darker background.

### The Glass & Gradient Rule
For the "Safety" state (Primary), do not use flat green. Apply a subtle linear gradient from `primary` (#006e1a) to `primary_container` (#28cd41) at a 135-degree angle. For floating overlays (e.g., map controls), use a backdrop-blur (20px) combined with `surface` at 80% opacity to achieve a high-end "frosted glass" aesthetic.

---

## 3. Typography: The Editorial Voice
We use a dual-typeface strategy to balance character with functional clarity.

*   **Display & Headlines (Manrope):** Our "Signature" voice. Manrope’s geometric yet warm curves should be used for large, expressive data points (e.g., distance tracked, dog name). Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, authoritative look.
*   **Body & Labels (Inter):** Our "Functional" voice. Inter provides maximum legibility for status updates, settings, and micro-copy. 

**Editorial Contrast:** Create impact by pairing a `display-sm` headline with a `label-sm` subtitle in all-caps with increased tracking (+0.1em). This "Big/Small" contrast is the hallmark of premium digital design.

---

## 4. Elevation & Depth
Depth is conveyed through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** To highlight a specific pet's location card, place a `surface-container-lowest` card on top of a `surface-container-low` background. This creates a soft, natural lift.
*   **Ambient Shadows:** When an element must "float" (like a CTA button or an emergency alert), use a shadow with a 24px blur, 0px offset, and 6% opacity using a tinted version of `on-surface` (#1a1c1f). This mimics natural, diffuse sunlight.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` (#bccbb5) at 20% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** A pill-shaped (`rounded-full`) container using the Primary Gradient. Text is `on-primary` (#ffffff) in `title-sm`.
*   **Secondary:** No background. A "Ghost Border" (`outline-variant` at 20%) with `primary` text.
*   **Tertiary (Alert):** Used for "Lost Dog" modes. Uses `tertiary` (#c0000a) with a pulse animation to signify urgency.

### Cards & Lists
*   **The Container:** Use `rounded-xl` (1.5rem) for all main cards. 
*   **No Dividers:** In a list of activities, do not use lines. Use a `surface-dim` background for every second item or simply 16px of vertical white space.
*   **Status Orbs:** For tracking status, use a 8px circle. `primary` for "Safe," `error` for "Out of Bounds." Apply a 4px outer glow of the same color at 30% opacity.

### Input Fields
*   **Minimalist Entry:** Text inputs should not have four-sided boxes. Use a `surface-container-highest` bottom-only bar (2px) that transforms into `primary` on focus. Labels should use `label-md` in `secondary` color.

### Tracking Specific: The "Safe-Zone" Radar
A custom component for this system. A circular `surface-container-high` element with a `primary` (Green) stroke representing the geofence. Use Glassmorphism for the "Dog Pointer" icon to keep the map visible underneath.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `primary_fixed` (#71ff74) for small accents on dark backgrounds to ensure "Apple-level" vibrance.
*   **Do** lean into asymmetry. For example, left-align a headline but right-align the primary data point to create a dynamic, editorial flow.
*   **Do** support Dark Mode by swapping `surface` with `inverse_surface` (#2e3034) while maintaining the same Tonal Layering logic.

### Don't
*   **Don't** use 100% black. Even in Dark Mode, use `inverse_surface` for a softer, more premium feel.
*   **Don't** use standard "Drop Shadows." If the shadow looks like a shadow, it’s too dark. It should look like "Depth."
*   **Don't** crowd the interface. If a screen feels full, increase the padding by 1.5x. Luxury is the luxury of space.