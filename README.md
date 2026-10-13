# DK-VLM project website

Project page for **DK-VLM: Geometry as Position for Spatial Reasoning in Vision-Language Models**.

This repository contains the English website, paper figures, experimental results, and the selected VSI-Bench and Reference-Frame Composition demos.

## Preview

Open `index.html` directly, or serve this directory locally:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8766/`.

## Contents

- `index.html`, `styles.css`, `app.js`: page content, styling, and interactions.
- `site-data.json`, `site-data.js`: demo data; the script bundle supports direct file previews. Update both together.
- `assets/`: paper PDF, figures, branding, video clips, and posters.

The page displays English only. The data files retain the original bilingual annotations for provenance. Model predictions are precomputed examples. RC angle predictions and annotation answers are shown separately.

Code, models, and RC annotations resource links will be added when released.

## Hosting

The site is static and can be served from the repository root. All local asset links are relative so the page can run under a GitHub Pages project URL.

