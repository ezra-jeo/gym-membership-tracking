# Stren Gym ERP Platform - Comprehensive Project Context

## Project Overview

**Stren** is a comprehensive gym management ERP platform designed to streamline member management, attendance tracking, QR-based check-in/out, analytics, and business operations for gym owners and managers.

### Key Objective
Rebrand and enhance the original TrackMyGym platform into a premium fitness business solution with professional marketing landing page and robust administration dashboard.

---

## Design System

### Color Palette

**Primary Brand Colors:**
- Stren Primary: `#D4956A` (Tan/Bronze)
- Stren Primary Light: `#E8B99A` (Sandy Tan)
- Stren Primary Dark: `#B5724A` (Deep Bronze)
- Stren Primary Glow: `rgba(212, 149, 106, 0.15)` (Accent background)

**Neutrals:**
- Charcoal: `#2C2C2C` (Deep text/sidebar)
- Graphite: `#3D3D3D` (Secondary depth)
- Smoke: `#5A5A5A` (Muted text)
- Gray: `#8A8A8A` (Secondary text)
- Light Gray: `#C4C4C4` (Borders)
- Surface: `#F2EDE8` (Light background)
- Background: `#FAF7F4` (Page background)
- White: `#FFFFFF` (Cards, modals)

**Semantic Colors:**
- Success (Check-ins): `#4CAF7D` (Iron Green)
- Danger (Check-outs): `#E05C5C` (Ember Red)
- Warning: `#E8A920` (Brass Yellow)

**Text Colors:**
- Primary: `#1A1A1A`
- Secondary: `#5A5A5A`
- Muted: `#8A8A8A`
- Inverse: `#FAF7F4` (For dark backgrounds)

### Typography

**Font Stack:**
- **Display (Headlines):** Playfair Display (serif) - weight 700
- **Headings:** Syne (sans-serif) - weights 400-800
- **Body:** Inter (sans-serif) - weights 400-700

**Font Sizes:**
- Hero: 6rem
- 5xl: 3rem
- 4xl: 2.5rem
- 3xl: 2rem
- 2xl: 1.5rem
- xl: 1.25rem
- lg: 1.125rem
- base: 1rem
- sm: 0.875rem
- xs: 0.75rem

**CSS Variables:**
```css
--font-display: 'Playfair Display', serif;
--font-heading: 'Syne', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Spacing System

Based on 4px base unit:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px
- `--space-24`: 96px

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-xl`: 24px
- `--radius-pill`: 9999px

### Shadows

- `--shadow-sm`: 0 1px 3px rgba(44, 44, 44, 0.08)
- `--shadow-md`: 0 4px 16px rgba(44, 44, 44, 0.12)
- `--shadow-lg`: 0 8px 32px rgba(44, 44, 44, 0.16)
- `--shadow-glow`: 0 0 24px rgba(212, 149, 106, 0.35)

---

## Technology Stack

### Frontend Framework
- **Next.js 16** (App Router)
- **React 19** (with TypeScript)
- **Tailwind CSS v4** (with custom design tokens)
- **Recharts** (for analytics/charts)
- **Lucide React** (icons)

### Data & Authentication
- Mock authentication (any email/password works)
- Mock data via Route Handlers
- No external integrations (user chose not to add)
- Can be replaced with real database/auth later

### Deployment
- Vercel-ready
- No required environment variables for current MVP

---

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                 # Root layout with fonts & metadata
│   ├── globals.css                # Design tokens & Tailwind config
│   ├── page.tsx                   # Redirects to /landing
│   ├── login/page.tsx             # Authentication page
│   ├── landing/page.tsx           # Marketing landing page
│   └── dashboard/
│       ├── layout.tsx             # Dashboard nav & sidebar layout
│       ├── page.tsx               # Main dashboard with stats & charts
│       ├── members/
│       │   ├── page.tsx           # Members list & management
│       │   └── [id]/page.tsx      # Member details & attendance
│       ├── checkin/page.tsx       # QR check-in/out interface
│       ├── classes/page.tsx       # Class scheduling & management
│       ├── plans/page.tsx         # Membership plan management
│       ├── staff/page.tsx         # Staff management & roles
│       ├── reports/page.tsx       # Analytics & reporting
│       └── settings/page.tsx      # Gym configuration
├── components/
│   └── ui/                        # shadcn/ui components
├── public/
│   ├── stren-logo.svg            # Brand logo
│   ├── lifetime-hero.jpg         # Yoga/wellness hero image
│   ├── gym-empty.jpg             # Modern gym interior image
│   ├── community-moment.jpg      # Community bonding image
│   └── owner-success.jpg         # Gym owner success image
├── STREN_GUIDE.md                # Feature documentation
└── PROJECT_CONTEXT.md            # This file

```

---

## Implemented Features

### 1. Landing Page (`/landing`)
- **Hero Section:** Full-width lifestyle imagery with compelling copy
- **Problem Section:** 4 pain points facing gym owners
- **Solutions Section:** Feature benefits with icons
- **How It Works:** 3-step onboarding process
- **Why Choose Stren:** 4 key benefits
- **Email Capture:** Lead generation section
- **Lifestyle Imagery:** 4 professional images integrated
- **Responsive Design:** Mobile-first, desktop-optimized

### 2. Authentication (`/login`)
- Email/password input fields
- Mock authentication (any credentials work)
- Session storage
- Redirect to dashboard on login
- Demo credentials display

### 3. Dashboard (`/dashboard`)
- **Header:** Welcome message with user greeting
- **Key Metrics:** 4 stat cards with color-coded icons
  - Active Members
  - Revenue (This Month)
  - Check-ins Today
  - Classes Scheduled
- **Charts:**
  - Attendance Trend (line chart)
  - Peak Hours (bar chart)
- **Recent Activity:** Real-time activity feed with status indicators
- **Color-coded status:** Green (check-in), Red (check-out), Tan (other)

### 4. Member Management (`/dashboard/members`)
- **Members List:** Searchable, filterable member database
- **Member Profiles:** Name, email, phone, plan type, status
- **Quick Actions:**
  - Search by name/email
  - Filter by status (active, inactive, pending)
  - Sort by membership date
  - View detailed member profiles
- **Member Details Page:** (`[id]`)
  - Full member information
  - Attendance history
  - Class enrollment
  - Payment status
  - Membership timeline

### 5. Check-In System (`/dashboard/checkin`)
- **QR Code Scanner:** Camera-based member scanning
- **Manual Entry:** Fallback ID/email input
- **Real-time Feedback:** Success/error messages
- **Member Lookup:** Instant member identification
- **Check-in/out Tracking:** Timestamp recording
- **Activity Log:** Recent check-ins display

### 6. Class Management (`/dashboard/classes`)
- **Class Schedule:** Grid view of weekly classes
- **Class Creation:** Add new classes with details
- **Capacity Management:** Max member limits
- **Class Types:** Yoga, CrossFit, Cardio, Strength, etc.
- **Enrollment Management:** Add/remove members
- **Instructor Assignment:** Staff assignment
- **Time Slots:** Flexible scheduling

### 7. Membership Plans (`/dashboard/plans`)
- **Plan Tiers:** Multiple pricing levels
  - Basic, Standard, Premium, VIP
- **Feature Matrix:** Highlights per plan
- **Pricing Display:** Monthly/annual rates
- **Conversion Tracking:** Plan upgrade metrics
- **Revenue Analytics:** Plan-based revenue breakdown

### 8. Staff Management (`/dashboard/staff`)
- **Team Directory:** All staff members
- **Role Management:** Admin, Manager, Trainer, Staff
- **Permissions:** Role-based access levels
- **Contact Info:** Email, phone, availability
- **Performance Metrics:** Member assignments, classes taught
- **Salary/Compensation:** Payment information

### 9. Reports & Analytics (`/dashboard/reports`)
- **Attendance Reports:** Daily, weekly, monthly trends
- **Revenue Reports:** Plan sales, income tracking
- **Member Growth:** New member metrics
- **Occupancy Reports:** Peak/low hours analysis
- **Staff Performance:** Member assignments, class attendance
- **Export Options:** CSV/PDF downloads

### 10. Settings (`/dashboard/settings`)
- **Gym Information:** Name, address, phone, hours
- **Notification Preferences:** Email alerts, SMS
- **Billing Settings:** Payment methods, invoicing
- **Security:** Password change, 2FA setup
- **Integration Settings:** API keys (future)
- **Theme:** Light/dark mode toggle (if implemented)

---

## Navigation Structure

### Main Routes

```
/ (root) → Redirects to /landing

/landing - Marketing landing page
  ├── Sign In button → /login
  └── Try Free button → /login

/login - Authentication portal
  └── After login → /dashboard

/dashboard - Main application
  ├── /dashboard (main overview)
  ├── /dashboard/members (member list)
  ├── /dashboard/members/[id] (member details)
  ├── /dashboard/checkin (QR scanner)
  ├── /dashboard/classes (class management)
  ├── /dashboard/plans (membership plans)
  ├── /dashboard/staff (team management)
  ├── /dashboard/reports (analytics)
  └── /dashboard/settings (configuration)
```

### Sidebar Navigation (Desktop)
Located in `/app/dashboard/layout.tsx`, includes links to:
1. Dashboard
2. Members
3. Check-In
4. Classes
5. Plans
6. Staff
7. Reports
8. Settings

Each nav item includes icon from lucide-react with hover effects using the tan primary color.

---

## Key Design Decisions

### 1. Font Selection
- **Playfair Display** for major headlines (elegant, serif)
- **Syne** for section headings (modern, bold)
- **Inter** for body text (clean, readable)
- Rationale: Creates luxury gym brand aesthetic while maintaining readability

### 2. Color Strategy
- **Primary: Tan (#D4956A)** → Professional, approachable, fitness-focused
- **Secondary: Charcoal (#2C2C2C)** → Strength, stability, premium feel
- **Semantic colors** → Clear status feedback (green success, red danger)
- Rationale: Mirrors Lifetime Fitness premium positioning

### 3. Layout Approach
- **Sidebar navigation** (desktop) - Persistent quick access
- **Mobile hamburger menu** - Responsive on smaller screens
- **Full-width hero sections** - Landing page visual impact
- **Grid layouts** - Analytics and data presentation
- **Flexbox** - Component spacing and alignment
- Rationale: Balances discoverability with clean whitespace

### 4. Authentication
- **Mock authentication** - No external dependencies for MVP
- **Any email/password** - Demo accessibility
- **localStorage** - Session persistence
- Rationale: Rapid prototyping, easy to replace with real auth (Supabase, Auth.js)

### 5. Data Management
- **Mock data via Route Handlers** - Simulated backend
- **In-memory storage** - No database integration
- **Future-ready** - Structure allows easy DB swap
- Rationale: Standalone prototype without external dependencies

---

## Notable Implementation Details

### Dashboard Layout (`/app/dashboard/layout.tsx`)
- Sticky sidebar with tan/charcoal color scheme
- Responsive mobile menu with hamburger icon
- User info section with logout button (red danger styling)
- Nav items with hover state using primary color glow
- Proper semantic HTML with accessibility labels

### Typography Consistency
All dashboard page headers follow pattern:
```tsx
<p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
  [Category Label]
</p>
<h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
  [Page Title]
</h1>
<p style={{ color: 'var(--color-text-secondary)' }}>
  [Description]
</p>
```

### Chart Components
- Recharts for data visualization
- Custom colors using CSS variables
- Responsive container handling
- Tooltip integration for data exploration

### Color Application for Stats
Stats cards use gradient backgrounds with 8% opacity hex notation:
```tsx
backgroundColor: `${color}15` // Adds transparency suffix
```

---

## Current State & Known Issues

### ✅ Completed
- All 8+ dashboard pages created and functional
- Landing page with premium lifestyle imagery
- Consistent design system across all pages
- Typography unified with Playfair Display for headings
- Mock authentication and data flow
- Responsive mobile design
- Color token system fully integrated
- Navigation structure complete

### ⚠️ Future Enhancements
- Real database integration (Supabase/Neon recommended)
- Authentication system (Auth.js or Supabase Auth)
- Image optimization (next/image integration)
- Email notifications system
- PDF export functionality
- Real QR code scanning (currently UI only)
- Dark mode toggle completion
- Search optimization
- Performance monitoring
- Analytics event tracking

---

## Styling Conventions

### CSS Variables Usage
All styling should use CSS variables defined in `globals.css`:

**Colors:**
```css
color: var(--color-primary);
background: var(--color-background);
border-color: var(--color-surface);
```

**Typography:**
```css
font-family: var(--font-display);        /* Headlines */
font-family: var(--font-heading);        /* Sections */
font-family: var(--font-body);           /* Body text */
```

**Spacing:**
```css
padding: var(--space-4);
gap: var(--space-6);
```

**Effects:**
```css
box-shadow: var(--shadow-md);
border-radius: var(--radius-lg);
```

### Tailwind + Inline Styles Pattern
Mix Tailwind classes with inline styles for design token consistency:

```tsx
<div className="p-6 rounded-lg border" style={{
  backgroundColor: 'var(--color-white)',
  borderColor: 'var(--color-surface)',
}}>
  <h3 style={{ 
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text-primary)',
  }}>
    Section Title
  </h3>
</div>
```

---

## Marketing Landing Page Structure

The `/landing` page follows Lifetime Fitness format with:

1. **Sticky Navigation** - Logo + Sign In CTA
2. **Hero Section** - Lifestyle image, headline, copy, dual CTAs
3. **Problem Section** - 4 gym owner pain points
4. **Solution Features** - 6 key feature benefits
5. **How It Works** - 3-step onboarding visual
6. **Why Choose Stren** - 4 trust/benefit callouts
7. **Image Section** - Full-width community imagery
8. **Email Capture** - Lead generation signup
9. **Footer** - Company info, links, legal
10. **Images:** 4 professional gym/fitness photos integrated

---

## For Future Developers

### Adding New Features
1. Create page in appropriate `/app/dashboard/[feature]/` directory
2. Update navigation in `layout.tsx` with new route
3. Apply consistent typography using design tokens
4. Use color variables from `globals.css`
5. Follow sidebar/header layout pattern

### Styling New Components
1. Always use `var(--color-*)` for colors
2. Use `var(--font-*)` for typography
3. Use `var(--space-*)` for spacing
4. Import lucide-react icons for UI elements
5. Maintain responsive design with Tailwind breakpoints

### Data Integration
- Current mock data lives in component state or Route Handlers
- Replace with actual API calls when database is connected
- Use SWR for client-side data fetching
- Implement proper error handling and loading states

---

## Contact & Branding

**Brand Name:** Stren
**Logo:** `/public/stren-logo.svg` (PNG image with tan/charcoal colors)
**Primary Use Case:** Gym management, member tracking, analytics
**Target User:** Gym owners, fitness facility managers
**Market Position:** Premium, professional, trustworthy gym ERP solution

---

## Additional Resources

- `STREN_GUIDE.md` - Detailed feature documentation
- `v0_plans/grand-implementation.md` - Original project plan
- `app/globals.css` - Complete design token definitions
- `app/layout.tsx` - Root layout with font configuration
