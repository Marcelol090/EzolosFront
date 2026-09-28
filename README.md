# EzolosFront

Frontend concept for the Ezolos landing page.

## What is implemented

- Dark Ezolos hero with the original public brand artwork.
- Compact live server information integrated directly into the header.
- Responsive menu drawer.
- Explore / Rankings / Bazaar / Community / Server Info / Wiki cards.
- Interactive 3D **Coins with bonus** ring with 9 packs, keyboard navigation, pointer drag, auto-rotation, hover/focus pause, dots and details dialog.
- Latest News, Today's Boosted, Community & Wiki, CTA and footer.
- Scroll reveal animations using `IntersectionObserver`, with `prefers-reduced-motion` support and transform/opacity-only motion to avoid layout shift.

## Run locally

No build step is required. Serve the repository as static files, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Files

- `index.html` — markup and content
- `styles.css` — responsive layout, design system and motion
- `app.js` — navigation, scroll reveals and store carousel

The current concept references public Ezolos image URLs so the repository stays lightweight.
