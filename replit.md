# ⵎⵓⵃⵎⵎⴷ Barber - Booking System

## Overview
A static HTML/CSS/JavaScript barber shop booking application in Arabic. The app allows customers to book appointments and includes an admin panel for managing bookings and announcements.

## Project Structure
- **index.html**: Main customer-facing booking page
- **admin.html**: Admin panel for managing bookings (password: admin123)
- **assets/css/style.css**: Styling for the entire application
- **assets/js/main.js**: Customer booking logic with localStorage
- **assets/js/admin.js**: Admin panel logic
- **server.py**: Simple Python HTTP server with cache control

## Key Features
- Client-side only (no backend database)
- Data stored in browser localStorage
- Daily booking capacity limits (configurable per day)
- Admin panel with simple password protection
- Announcement system for customer notifications
- Arabic/RTL interface
- WhatsApp integration links

## Technical Details
- **Language**: Pure HTML/CSS/JavaScript (no framework)
- **Data Storage**: Browser localStorage
- **Server**: Python HTTP server on port 5000
- **Deployment**: Static site suitable for autoscale deployment

## Booking Capacity
- Sunday-Tuesday: 3 bookings per day
- Friday-Saturday: 5 bookings per day
- Wednesday-Thursday: 1000 bookings (essentially unlimited)

## Recent Changes
- 2025-10-20: Initial setup in Replit environment
  - Added Python HTTP server with cache control
  - Configured workflow for serving on port 5000
  - Set up deployment configuration for autoscale
