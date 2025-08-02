# 404 Error Page Implementation

## Overview
A custom 404 error page has been implemented that displays when users navigate to non-existent routes or encounter errors on the website.

## Features
- **Animated Design**: Features smooth animations for both the 404 text and cat image
- **Responsive Layout**: Fully responsive design that works on all screen sizes
- **Dark Theme**: Dark background with white text for a modern look
- **Cat Image**: Features a mysterious black cat in a hooded cloak
- **Custom Text**: Displays "ОКАК" text overlay

## Files Created/Modified

### New Files:
- `src/pages/Error404.jsx` - React component for the 404 page
- `src/pages/Error404.css` - Styling for the 404 page
- `public/img/cat.png` - Cat image for the 404 page

### Modified Files:
- `src/App.jsx` - Added catch-all route (`path="*"`) to handle 404 errors

## How It Works

1. **Routing**: The catch-all route `<Route path="*" element={<Error404 />} />` in `App.jsx` captures all unmatched routes
2. **Animation**: The page features two main animations:
   - `errorAnim`: Moves the "404" text from bottom to center
   - `catAnim`: Moves the cat image from bottom to final position
3. **Responsive Design**: Different font sizes and positioning for various screen sizes:
   - Desktop: 750px font size for "404"
   - Tablet (1200px): 400px font size
   - Mobile (768px): 180px font size
   - Small Mobile (480px): 80px font size

## Usage
The 404 page will automatically display when:
- Users navigate to non-existent routes
- There are routing errors
- Any unmatched URL patterns

## Styling Details
- **Background**: Dark (#050505)
- **Font**: Montserrat (sans-serif)
- **Colors**: White text on dark background
- **Animations**: 1.5s ease transitions
- **Layout**: Full viewport height with overflow hidden

## Browser Compatibility
- Modern browsers with CSS Grid and Flexbox support
- Responsive design works on mobile, tablet, and desktop
- CSS animations are supported in all modern browsers 