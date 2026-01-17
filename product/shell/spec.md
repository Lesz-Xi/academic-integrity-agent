# Application Shell Specification

## Overview

The application shell for **Sovereignty Shield** provides a consistent navigation and layout wrapper across all authenticated views. It uses a **Sidebar Navigation** pattern optimized for dashboard-style interactions with multiple sections.

---

## Navigation Structure

| Nav Item | Section | Icon | Access |
|----------|---------|------|--------|
| New Generation | Main generator view | `Plus` | All users |
| Drafting Canvas | Editor view | `FileText` | All users (Beta) |
| Certificates | Certificate modal | `Award` | All users |
| Defense Toolkit | Defense modal | `ShieldAlert` | Premium only |
| History | Grouped by mode | `History` | All users |
| Theme Toggle | - | `Sun/Moon` | All users |
| Sign Out | - | `LogOut` | All users |

---

## User Menu

**Location:** Bottom of sidebar (footer section)

**Contents:**
- User avatar (first letter of email)
- Username (email prefix)
- Premium badge (if applicable)
- Upgrade prompt (for free users)

---

## Layout Pattern

**Pattern:** Sidebar Navigation (Vertical nav on left, content on right)

**Rationale:** 
- Multiple sections requiring quick access
- Dashboard-style tool with history
- Admin panel patterns for power users

---

## Responsive Behavior

### Desktop (≥1024px / `lg:`)
- Sidebar visible by default
- Collapsible with animation (width: 288px → 0)
- Keyboard shortcut: `Cmd+.` / `Ctrl+.`
- Content area adjusts with `ml-72` when sidebar open

### Tablet (768px - 1023px / `md:`)
- Sidebar hidden by default
- Hamburger menu in header
- Overlay mode when open (not inline)
- Backdrop blur on content

### Mobile (<768px)
- Sidebar as full-height slide-in overlay
- Fixed header with hamburger trigger
- Touch-optimized tap targets (48px minimum)
- Backdrop click to close

---

## Animation Specifications

### Sidebar Toggle
```css
transition: all 300ms ease-in-out;
transform: translateX(0) → translateX(-100%);
width: 288px → 0;
```

### Overlay Backdrop
```css
transition: opacity 300ms;
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
```

### Content Shift (Desktop)
```css
transition: margin-left 300ms ease-in-out;
margin-left: 288px → 0;
```

---

## Design Notes

1. **Glassmorphism Header**: Sticky header uses `bg-opacity-80` and `backdrop-blur-sm` for premium feel
2. **Floating Elements**: Decorative gradient blurs in background for depth
3. **Active States**: Gold accent (#C1A87D) for active nav items
4. **Hover States**: Subtle background changes, never jarring
5. **Dark Mode**: Full support using `dark:` variants

---

## Accessibility

- Focus indicators on all interactive elements
- Keyboard navigation through sidebar
- `aria-labels` on icon-only buttons
- Reduced motion support via `prefers-reduced-motion`
- Proper heading hierarchy in content area
