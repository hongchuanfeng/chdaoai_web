# Favicon Setup

To generate and add a favicon to your project:

1. Visit https://favicon.io/ or any favicon generator
2. Create a favicon.ico file (16x16, 32x32, or 48x48 pixels recommended)
3. Replace the placeholder file at `public/favicon.ico` with your actual favicon

The favicon is already configured in `app/layout.tsx` and will be automatically used by browsers.

You can also generate additional icon sizes for better support:
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png (180x180)

These can be added to the `public` folder and referenced in the layout if needed.
