# adultapp UI / HTML inspector update (2026-04-11)

## Included changes
- Search and settings overlays are isolated from the active bottom-tab content.
- Settings category menu now uses stacked full-width button rows.
- Added direct ON/OFF control for `HTML요소`.
- Added Ctrl + left click inspector popup to extract selector, HTML, text, and key computed styles.

## Inspector usage
1. Open `설정`.
2. Turn `HTML요소` to `ON`.
3. Hold `Ctrl` and left-click any target element.
4. Copy `selector`, `style`, or `html` from the popup.

## Build check
- `npm install`
- `npm run build`
