# Ilyas Portfolio - Neural Elegance Theme

A stunning, interactive portfolio website showcasing your work as a Data Scientist and AI Engineer. Built with pure HTML, CSS, and JavaScript — no frameworks needed.

## ✨ Features

- **Neural Network Animation** — Interactive canvas background that responds to mouse movement
- **AI Assistant Chatbot** — Embedded chatbot to engage visitors and schedule calls
- **Project Showcases** — Modal windows with architecture diagrams
- **Interactive Skills** — Visual skill tags with proficiency levels
- **Smooth Animations** — Scroll-triggered fade-ins and hover effects
- **Fully Responsive** — Works beautifully on all devices
- **Easy to Customize** — CSS variables for quick theme changes
- **Zero Cost** — Free hosting on GitHub Pages

## 🚀 Quick Start

### 1. Setup GitHub Repository

```bash
# Create a new repository on GitHub named: yourusername.github.io
# Clone it locally
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io

# Copy these portfolio files into the repo
```

### 2. Customize Your Information

Edit these files to add your personal details:

#### `index.html`
- Update contact links (email, LinkedIn, GitHub, Calendly)
- Modify project descriptions if needed
- Add/remove skills in the skills section
- Update the hero section tagline

#### `script.js`
Look for the `ilyasInfo` object and update:
```javascript
const ilyasInfo = {
    name: "Your Name",
    email: "your.email@example.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    calendly: "https://calendly.com/yourlink",
    // ... etc
};
```

#### `styles.css`
Change colors by editing CSS variables at the top:
```css
:root {
    --accent-primary: #00d4aa;      /* Main accent color */
    --accent-secondary: #00b4d8;    /* Secondary accent */
    --bg-primary: #0a0f1a;          /* Background color */
    /* ... etc */
}
```

### 3. Add Your Headshot

Replace `headshot.jpg` in the root folder with your professional photo.
- Recommended: Square image, at least 400x500px
- Format: JPG or PNG

### 4. Deploy to GitHub Pages

```bash
git add .
git commit -m "Initial portfolio deploy"
git push origin main
```

Go to your repository Settings → Pages → Select "main" branch → Save

Your portfolio will be live at: `https://yourusername.github.io`

## 🎨 Customization Guide

### Color Themes

**Dark Ocean (Default)**
```css
--accent-primary: #00d4aa;
--accent-secondary: #00b4d8;
--bg-primary: #0a0f1a;
```

**Purple Glow**
```css
--accent-primary: #a855f7;
--accent-secondary: #6366f1;
--bg-primary: #0f0a1a;
```

**Emerald Tech**
```css
--accent-primary: #10b981;
--accent-secondary: #06b6d4;
--bg-primary: #0a1a14;
```

**Golden Professional**
```css
--accent-primary: #f59e0b;
--accent-secondary: #ef4444;
--bg-primary: #1a150a;
```

### Adding New Projects

1. Add a new project card in the HTML (copy existing `.project-card` structure)
2. Add project data in `script.js` inside the `projectData` object
3. Update the architecture diagram ASCII art

### Connecting Claude API for Smart Chatbot

To make the chatbot use real AI:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. In `script.js`, find the Claude API comment section at the bottom
3. Uncomment the `getClaudeResponse` function
4. Add your API key

**Security Note:** For production, never expose API keys in client-side code. Use:
- Serverless functions (Vercel, Netlify Functions)
- A simple backend proxy

## 📁 File Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── headshot.jpg        # Your profile photo
└── README.md           # This file
```

## 📱 Responsive Design

The portfolio is fully responsive with:
- Collapsible navigation on mobile
- Touch-friendly interactions
- Optimized typography scaling
- Adjusted layouts for smaller screens

## ⚡ Performance

- All animations use CSS transforms for GPU acceleration
- Canvas animation is lightweight (~80 nodes)
- No external dependencies except Google Fonts

## 🎯 SEO Optimization

Add these meta tags to `<head>` for better search visibility:

```html
<meta property="og:title" content="Your Name - AI Engineer Portfolio">
<meta property="og:description" content="Your description here">
<meta property="og:image" content="https://yoursite.com/og-image.jpg">
<meta property="og:url" content="https://yoursite.com">
<meta name="twitter:card" content="summary_large_image">
```

## 📊 Adding Analytics

Insert before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🌐 Custom Domain

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In GitHub repo: Settings → Pages → Custom Domain
3. Configure DNS with these A Records:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

---

Built with 💚 | Neural Elegance Theme
