# Cloverton Homes - Premium Residential Builder

A modern, responsive website built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **Hero Section** with search functionality
- **Pathway Cards** for different building options
- **Design Carousel** showcasing property designs
- **Testimonials** from happy homeowners
- **Contact Form** for lead generation
- **Floating Chat Button** for customer support
- **Fully Responsive** mobile-first design
- **Brand Colors**: Deep Slate Teal (#234252) and Charcoal (#222222)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Fixed header with logo
│   ├── HeroSection.tsx     # Hero with search widget
│   ├── PathwayCards.tsx    # Building pathway options
│   ├── ExperienceGrid.tsx  # Feature highlights
│   ├── DesignCarousel.tsx  # Property carousel
│   ├── Testimonial.tsx     # Customer testimonials
│   ├── ContactForm.tsx     # Lead capture form
│   └── FloatingChat.tsx    # Fixed chat button
```

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Google Fonts** - Inter & Outfit typefaces
- **Material Symbols** - Icon library

## Hostinger Deployment

Configure Hostinger to deploy the repository root from the `main` branch as an
Express application. Express is the public process; it serves the API and the
compiled Next.js website from one Node.js service.

- Framework preset: `Express`
- Node.js version: `20.9.0` or newer (Node.js 22 LTS recommended)
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `app.js`
- Output directory: leave empty (use `.` only if Hostinger requires a value)
- Application port: use Hostinger's `PORT` environment variable

Add the production variables listed in `server/.env.example` through Hostinger's
environment variable settings. At minimum, configure the database,
Better Auth, trusted origin, frontend URL, and SMTP values. Do not commit a real
`.env` file or any credentials to Git.

## Customization

Brand colors can be modified in `tailwind.config.ts`:

```typescript
colors: {
  'brand-teal': '#234252',
  'brand-charcoal': '#222222',
}
```
