# Cloverton Homes - Premium Residential Builder

A modern, responsive website built with Next.js 14, TypeScript, and Tailwind CSS.

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

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Google Fonts** - Inter & Outfit typefaces
- **Material Symbols** - Icon library

## Customization

Brand colors can be modified in `tailwind.config.ts`:

```typescript
colors: {
  'brand-teal': '#234252',
  'brand-charcoal': '#222222',
}
```
