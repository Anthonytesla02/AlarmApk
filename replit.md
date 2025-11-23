# Gemini Smart Alarm

## Overview
A smart alarm clock application built with React, TypeScript, and Vite that uses Google's Gemini AI to generate personalized wake-up messages. The app allows users to create multiple alarms with custom settings and features AI-powered motivational messages when alarms are dismissed.

**Current Status:** Fully configured and ready to run on Replit

**Last Updated:** November 23, 2025

## Project Architecture

### Tech Stack
- **Frontend Framework:** React 19.2
- **Build Tool:** Vite 6.2
- **Language:** TypeScript 5.8
- **UI Styling:** Tailwind CSS (via CDN)
- **AI Integration:** Google Gemini AI (gemini-2.5-flash model)
- **Icons:** Lucide React

### Project Structure
```
/
├── components/          # React components
│   ├── AlarmEditor.tsx  # Alarm creation/editing interface
│   ├── AlarmItem.tsx    # Individual alarm display
│   └── RingingScreen.tsx # Alarm ringing interface
├── services/            # Service layer
│   ├── audioService.ts  # Audio playback handling
│   └── geminiService.ts # Gemini AI integration
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
└── package.json        # Project dependencies
```

### Key Features
- Multiple alarm management with enable/disable toggles
- Repeating alarms (specific days of week)
- Snooze functionality
- Smart alarms with AI-generated wake-up messages
- Audio playback for alarm sounds
- Local storage persistence
- Mobile-friendly PWA design

## Configuration

### Environment Variables
The application requires the following secret:
- `GEMINI_API_KEY` - Google Gemini API key for AI-powered wake-up messages

You can obtain a Gemini API key from [Google AI Studio](https://ai.google.dev/).

### Development Server
- **Port:** 5000
- **Host:** 0.0.0.0 (configured for Replit proxy)
- **Proxy Support:** Enabled with `allowedHosts: true` in Vite config

### Workflow
- **Name:** Start application
- **Command:** `npm run dev`
- **Output Type:** Webview
- **Port:** 5000

## Deployment

### Deployment Configuration
- **Type:** Static site
- **Build Command:** `npm run build`
- **Public Directory:** `dist`

The application is configured for static deployment. When published, the build process:
1. Compiles TypeScript to JavaScript
2. Bundles React components
3. Optimizes assets
4. Outputs to the `dist/` directory

### Important Notes
- **SECURITY CONSIDERATION:** This application was originally designed for Google AI Studio and uses a client-side architecture where the Gemini API key is bundled into the frontend JavaScript. This means the API key will be visible to anyone who inspects the deployed application. For personal use only.
- The Gemini API key must be set in the `GEMINI_API_KEY` secret in Replit
- The build process injects the API key via Vite's define configuration into the client bundle
- Tailwind CSS uses CDN in development (should be properly installed for production optimization)
- **For production use with sensitive API keys, consider:**
  - Implementing a backend proxy to keep the API key server-side
  - Using API key restrictions in Google Cloud Console (HTTP referrer restrictions)
  - Monitoring API usage and setting quotas

## Recent Changes
- **2025-11-23:** Initial Replit setup
  - Configured Vite to use port 5000
  - Added `allowedHosts: true` for Replit proxy support
  - Configured deployment settings for static hosting
  - Set up workflow for development server

## Development

### Running Locally
1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` secret in Replit Secrets
3. Run the development server: `npm run dev` (or use the "Start application" workflow)
4. Access the app at the Replit webview URL

### Building for Production
```bash
npm run build
```

The optimized production build will be output to the `dist/` directory.

## User Preferences
None documented yet.

## Known Issues
- Tailwind CSS is loaded via CDN (shows warning in console but works fine)
- For production, consider installing Tailwind CSS as a PostCSS plugin for optimization
