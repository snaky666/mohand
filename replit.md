# ⵎⵓⵃⵎⵎⴷ Barber - Booking System

## Overview
A premium static HTML/CSS/JavaScript barber shop booking application in Arabic. The app features a stunning modern design with smooth animations, glassmorphism effects, branded social media icons, and a beautiful dark theme. Customers can book appointments and admins can manage bookings and announcements.

## Project Structure
- **index.html**: Main customer-facing booking page
- **admin.html**: Admin panel for managing bookings (password: admin123)
- **assets/css/style.css**: Premium CSS with modern effects and animations
- **assets/js/main.js**: Customer booking logic with localStorage
- **assets/js/admin.js**: Admin panel logic
- **server.py**: Python HTTP server with cache control

## Key Features
- **Premium Design**: Modern dark theme with glassmorphism, gradients, and smooth animations
- **Branded Social Icons**: Professional SVG icons with official brand colors:
  - WhatsApp: Green gradient (#25D366 to #128C7E)
  - Instagram: Multi-color gradient (purple to pink to orange)
  - Facebook: Blue gradient (#1877F2 to #0C63D4)
- Client-side only (no backend database)
- Data stored in browser localStorage
- Daily booking capacity limits (configurable per day)
- Admin panel with simple password protection
- Announcement system for customer notifications
- Arabic/RTL interface with beautiful typography
- WhatsApp integration links
- Fully responsive design for all devices

## Design Highlights
- Glassmorphism cards with backdrop blur
- Animated gradients on logo and buttons
- Professional SVG social media icons with brand colors
- Smooth hover effects with scale and glow
- Premium color palette (gold, coral, purple accents)
- Enhanced form inputs with focus states
- Beautiful shadows and glow effects
- Accessible contrast ratios

## Technical Details
- **Language**: Pure HTML/CSS/JavaScript (no framework)
- **Data Storage**: Browser localStorage
- **Server**: Python HTTP server on port 5000
- **Deployment**: Static site suitable for autoscale deployment
- **Font**: Tajawal (Google Fonts) for Arabic support
- **Icons**: Inline SVG with brand-specific styling

## Booking Capacity
- Sunday-Tuesday: 3 bookings per day
- Friday-Saturday: 5 bookings per day
- Wednesday-Thursday: 1000 bookings (essentially unlimited)

## Recent Changes
- 2025-10-20: Initial setup in Replit environment
  - Added Python HTTP server with cache control
  - Configured workflow for serving on port 5000
  - Set up deployment configuration for autoscale
  
- 2025-10-20: Premium CSS Upgrade
  - Enhanced color schemes and gradients
  - Added smooth animations and transitions
  - Implemented glassmorphism effects
  - Improved shadows, borders, and lighting
  - Created premium hover states and micro-interactions
  - Optimized for readability and accessibility
  - Added responsive design improvements
  - Integrated Google Fonts (Tajawal) for better typography

- 2025-10-20: Social Media Icons Enhancement
  - Replaced emoji icons with professional SVG icons
  - Added branded gradient backgrounds for each platform
  - Implemented smooth hover animations with scale and glow
  - Added drop shadows for better contrast
  - Icons work perfectly in both header and footer
  - Maintained WhatsApp link functionality
