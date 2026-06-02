# 🚀 NovaBuild AI — High-Fidelity Frontend Client

**NovaBuild AI** is a state-of-the-art AI-powered website generator. It empowers creators to transform natural language prompts into production-ready web designs in seconds, featuring a premium design system, fluid motion mechanics, and a beautiful resizable workspace.

This module houses the **entire high-fidelity frontend interface**, meticulously engineered to set a new benchmark for web application UI/UX, featuring complete responsive coverage, deep keyboard accessibility, and micro-interactions.

---

## 🎨 UI/UX Highlight & Key Features

### 🌟 1. Premium Glassmorphism Design System
- **Modern Theme Palette:** Built on a dark-first color scheme using tailwind custom colors (brand base `#0F0F1A` with gorgeous purple and pink gradient accents `#6C63FF` ➔ `#FF6584`).
- **Glassmorphism Backdrop Controls:** Custom custom CSS utility filters (`.glass`, `.glass-hover`, `.glass-card`) that provide frosted glass effects with dynamic borders that glow on hover.
- **Tailored Typography:** Leveraging modern fonts with modular sizing and optimized line-height scales for premium contrast and balance.
- **Aesthetic Elements:** Seamless animated scrollbars, beautiful focus indicator rings, and vibrant radial ambient gradients.

### 📊 2. Dynamic Project Dashboard (`/dashboard`)
- **Visual Performance Cards:** Key metrics showing total projects created, active drafts, and editing hours.
- **Comprehensive Project Grid:** Responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile) featuring beautiful animated project card entries.
- **Search, Sort, and Toggle Systems:** Real-time query search, multiple sorting options (Last Modified, Name, Creation Date), and instant Grid vs. List layout toggle.
- **Complete Modals Pipeline:**
  - *New Project Creator:* Beautiful modal featuring input fields and templates (Blank, Portfolio, Landing Page) with selection ring highlights.
  - *Secure Project Deletion:* A critical hazard-styled modal requiring the user to type the exact project name to confirm deletion.
  - *Rename Utility:* Quick inline rename with validation and auto-selection on focus.
- **Rich Empty and Loading States:** Premium illustrations for empty search lists and shimmering skeleton animations for simulated data-fetching.

### ✏️ 3. Full-Fidelity Resizable Editor (`/editor/:id`)
- **Resizable Split Layout:** Seamless split panel with draggable divider dividing the Prompt Panel (left) and Live Preview (right). Dragging adjusts sizes instantly, with Arrow-key keyboard resizing support.
- **Interactive Chat Prompt Panel:** Auto-growing textarea, instant sample prompt suggestions, custom message bubbles with sleek user/AI avatars, and custom typing indicator animations.
- **Device Viewport Modifiers:** Fully animated layout resizing enabling live design testing across Desktop (100% width), Tablet (768px), and Mobile (375px) in an animated browser shell.
- **Export Package Utility:** Download buttons equipped with visual compression timers and real-time file triggers to export files as clean zip files.

### 👤 4. Personalized Settings & Account Screen (`/account`)
- **Interactive Profile Editor:** Custom picture uploading layout, input name fields, and email settings wrapped in premium cards.
- **Preferences System:** Active preferences dashboard containing a styled Custom Switch for toggling themes and notifications.
- **Danger Zone Panel:** Highly visible Red Danger card facilitating smooth account deletion flows.

### 🛑 5. Dynamic 404 Experience (`*`)
- Features a giant floating ghost illustration with custom floating keyframe animations, returning links, and deep stellar background gradients.

---

## 🛠️ Technical Stack & Architecture

- **Core Framework:** React 18 & TypeScript
- **Bundler & Server:** Vite
- **Styling Core:** Tailwind CSS (extended theme configs, custom variables)
- **Animation System:** Framer Motion (staggered entries, smooth layout shifts, Spring physics)
- **Icons Library:** Lucide React
- **Router Configuration:** React Router DOM (v7) with Lazy-loading & custom React Suspense skeleton fallbacks for optimal initial loads.
- **Quality Assurance:** Strictly audited TypeScript (strict checks) and custom ESLint settings.

---

## ⚡ Setup & Local Execution

Ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Navigate to the Client Directory:**
   ```bash
   cd client
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run the Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:3000`** to view the app!

4. **Verify TypeScript Compilation:**
   ```bash
   npx tsc --noEmit
   ```
   Ensure compilation passes successfully with zero warnings/errors.

5. **Run Linting Audits:**
   ```bash
   npm run lint
   ```
   Maintains zero code quality warnings and ensures strict linting rules are fully satisfied.

---

## 🎤 Tips for Presenting This Project to a Jury/Instructors

If you are demonstrating this frontend to a jury, teachers, or colleagues, highlight the following features to show your mastery of professional UI/UX engineering:

1. **Highlight the Resizable Workspace:**
   *Show them the Editor screen (`/editor/demo`). Drag the central divider left and right. Explain that it is constrained (won't break the layout) and utilizes modern hooks. Show how you can use keyboard arrow keys on the divider to shift it.*
2. **Demonstrate Device Responsiveness:**
   *Click the Viewport icons (Desktop, Tablet, Mobile) in the editor toolbar. Show how the simulated preview frame scales down with a silky smooth spring animation. Frame this as "simulating real-world responsive testing."*
3. **Show Off the Deletion Safeguard:**
   *Go to the dashboard, hover over a project card, click the trash icon, and show how the button stays disabled until you type the exact name. Explain that this is a critical enterprise UX pattern for preventing accidental loss of data.*
4. **Trigger Toast Notifications:**
   *Rename a project or click the export zip button. Point out the elegant toast slider that pops in from the corner. Note how subsequent toasts stack up gracefully and auto-dismiss.*
5. **Demonstrate Motion and Polish:**
   *Show how cards scale up slightly on hover, how lists transition to grids seamlessly with Framer Motion `layout` prop, and how the typing dots indicator pulses. Present this as "micro-interactions that increase user retention and satisfaction."*