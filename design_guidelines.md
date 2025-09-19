# InvoiceFlow Design Guidelines

## Design Approach
**Selected Approach:** Design System (Material Design influenced)
**Justification:** This is a utility-focused business application where efficiency, data clarity, and professional appearance are paramount. The app handles financial data requiring trust and reliability through consistent, clean design patterns.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light Mode: 217 91% 60% (Professional blue)
- Dark Mode: 217 91% 70% (Lighter blue for contrast)

**Neutral Colors:**
- Background Light: 0 0% 98%
- Background Dark: 222 84% 5%
- Text Primary Light: 222 84% 15%
- Text Primary Dark: 210 40% 95%

**Accent Colors:**
- Success (Paid): 142 71% 45%
- Warning (Pending): 38 92% 50%
- Error: 0 84% 60%

### Typography
**Font Family:** Inter (Google Fonts)
**Hierarchy:**
- Headers: 600 weight, 24-32px
- Subheaders: 500 weight, 18-20px
- Body: 400 weight, 14-16px
- Captions: 400 weight, 12-14px

### Layout System
**Spacing Units:** Tailwind spacing of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Element gaps: gap-2, gap-4

### Component Library

**Navigation:**
- Clean sidebar with company logo at top
- Primary navigation items with subtle hover states
- Active page highlighted with primary color background

**Forms & Inputs:**
- Clean, minimal input fields with subtle borders
- Focus states using primary blue color
- Grouped form sections with proper spacing
- Currency selector with clear visual hierarchy

**Data Display:**
- Professional invoice layout with blue header sections
- Clean table rows with alternating backgrounds
- Highlighted remaining balance in blue background box
- Clear typography hierarchy for financial data

**Buttons:**
- Primary: Blue background, white text
- Secondary: Outline style with blue border
- Minimal hover animations for professional feel

**Cards & Containers:**
- Subtle shadows for depth
- Rounded corners (4-6px radius)
- Clean white/dark backgrounds
- Proper content spacing

**Dashboard Elements:**
- KPI cards with large numbers and clear labels
- Chart areas with consistent color usage
- Filter controls with clean selection states

### Professional Features
- Company watermark integration on invoices
- PDF-ready layouts with print-friendly styling
- Currency formatting without decimals (Rs 5000 style)
- Status indicators using color-coded badges
- Clear visual hierarchy for financial calculations

### No Hero Images
This application focuses on data and functionality rather than marketing appeal. All visual emphasis should be on clear data presentation and efficient workflows.