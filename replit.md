# ⵎⵓⵃⵎⵎⴷ Barber - Booking System

## Overview
A premium static HTML/CSS/JavaScript barber shop booking application in Arabic. The app features a stunning modern design with smooth animations, glassmorphism effects, branded social media icons, and a beautiful dark theme. Customers can book appointments, view services and promotions, and admins can manage bookings and announcements.

## Project Structure
- **index.html**: Main customer-facing booking page
- **ads.html**: Services and promotions page with pricing
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
- **Ads Page**: Dedicated page for services and promotions with:
  - Responsive grid layout
  - Featured cards with special styling
  - Pricing display with old/new prices
  - Service badges (special offers, new)
  - Additional services list
- Client-side only (no backend database)
- Data stored in browser localStorage
- Daily booking capacity limits (configurable per day)
- Admin panel with simple password protection
- Announcement system for customer notifications
- Arabic/RTL interface with beautiful typography
- WhatsApp integration links
- Fully responsive design for all devices

## Pages
1. **Home (index.html)**: Booking form and upcoming reservations
2. **Ads (ads.html)**: Services, promotions, and pricing
3. **Admin (admin.html)**: Manage bookings and announcements

## Design Highlights
- Glassmorphism cards with backdrop blur
- Animated gradients on logo and buttons
- Professional SVG social media icons with brand colors
- Smooth hover effects with scale and glow
- Premium color palette (gold, coral, purple accents)
- Enhanced form inputs with focus states
- Beautiful shadows and glow effects
- Accessible contrast ratios
- Staggered animations for ad cards

## Technical Details
- **Language**: Pure HTML/CSS/JavaScript (no framework)
- **Data Storage**: Browser localStorage
- **Server**: Python HTTP server on port 5000
- **Deployment**: Static site suitable for autoscale deployment
- **Font**: Tajawal (Google Fonts) for Arabic support
- **Icons**: Inline SVG with brand-specific styling

## Services & Pricing
- Haircut + Beard trim: 1200 DZD (special offer)
- Traditional shave: 800 DZD
- Hair coloring: from 1000 DZD
- Kids haircut: 500 DZD
- Family package: 1360 DZD (20% discount)
- Hair care treatment: 600 DZD
- Plus additional services

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

- 2025-10-20: Ads Page Implementation
  - Created dedicated ads/promotions page (ads.html)
  - Implemented responsive grid layout for service cards
  - Added featured cards with gradient borders
  - Created service badges for special offers and new items
  - Designed pricing display with strikethrough old prices
  - Added services list with pricing
  - Implemented staggered fade-in animations
  - Added navigation links across all pages
  - Fixed mobile responsiveness with media queries
  - Ensured no horizontal scrolling on small screens
