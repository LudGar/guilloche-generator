# Guilloche / Spirograph SVG Generator

A lightweight, browser-based guilloché (spirograph-style) pattern generator that renders interactive line art to SVG.  
Built for exploration and precision: tweak parameters live, pan and zoom the preview, then export a clean, tightly-fitted SVG containing **only** the line work.

## Features

- **Guilloché / spirograph-style curves** generated from layered trigonometric functions
- **Live preview** while adjusting parameters
- **Pan & zoom**
  - Pan: click and drag
  - Zoom: mouse wheel (centered on cursor)
- **Clean SVG export**
  - Transparent by default
  - No background shapes
  - `viewBox` fitted to the drawing’s exact bounds
- **Presets**
  - Built-in presets
  - Save, load, and delete **custom presets** (stored in `localStorage`)
- **Randomize** button for quick exploration of patterns

Getting Started,
Just Open the url in the top right.

or

Run locally,
This project is a static HTML/CSS/JavaScript application. No build step is required.

so
python -m http.server 8080
open via localhost


Scales

Offsets & repeat parameters
Stroke thickness and line color
Pan the preview by dragging with the mouse
Zoom using the mouse wheel
Click Download SVG to export

Export Behavior

Exported SVGs:
Contain only stroke paths
No background

Use a viewBox fitted to the drawing’s bounding box
Width and height attributes are removed so the SVG scales cleanly in other applications.

Custom Presets
Custom presets are stored locally in the browser using localStorage.

Storage key: guillocheCustomPresetsV1

To reset all custom presets:

Open browser DevTools
Go to Application → Local Storage
Delete the key guillocheCustomPresetsV1

Performance Notes
Very high repeat counts can increase CPU usage.
SVG export relies on geometry bounding boxes (getBBox()), which are accurate for path-based drawings.
The tool is optimized for vector output rather than raster rendering.

Roadmap / Ideas
Reset View button (recenter + reset zoom)
Optional stroke styles (dash patterns, line joins, caps)
Multi-color or gradient cycling across repeats
Seeded randomization for reproducible results

License
This project is licensed under the GNU General Public License v3.0.

You are free to:
Use
Modify
Distribute
Share

…as long as derivative works remain licensed under GPL-3.0 and the source is made available.

See the LICENSE file for full details.
