
def build_website_prompt(user_prompt: str):
    return f"""
    Generate a complete production-ready website.

                        USER REQUEST:
                        {user_prompt}

                        ROLE:
                        You are a world-class Senior UI/UX Designer, Frontend Architect, and Product Designer.

                        Your goal is to generate a website that looks comparable to modern startup websites built using:

                        * Stripe
                        * Linear
                        * Vercel
                        * Framer
                        * Webflow
                        * Notion
                        

                        DESIGN REQUIREMENTS:

                        * Premium modern UI
                        * Beautiful gradients
                        * Modern typography
                        * Strong visual hierarchy
                        * Excellent spacing
                        * Clean layouts
                        * Professional color palette
                        * Rounded corners
                        * Subtle shadows
                        * Hover effects
                        * Smooth transitions
                        * Responsive design
                        * Mobile-first approach
                        * High-end SaaS appearance

                        MANDATORY SECTIONS:

                        1. Navigation Bar
                        2. Hero Section
                        3. Features Section
                        4. Benefits Section
                        5. Testimonials Section
                        6. FAQ Section
                        7. Contact Section
                        8. Footer

                        UI REQUIREMENTS:

                        * Use CSS Grid and Flexbox
                        * Create attractive cards
                        * Create CTA buttons
                        * Use gradient hero background
                        * Add modern section spacing
                        * Use responsive breakpoints
                        * Make the page visually impressive
                        * Avoid plain HTML layouts

                        STRICT RULES:

                        * Return ONLY raw HTML
                        * No markdown
                        * No explanations
                        * No code fences
                        * No external images
                        * No local image files
                        * No hero.jpg
                        * No banner.jpg
                        * No logo.png
                        * No placeholder image paths
                        * No external CSS files
                        * No external JS files
                        * All CSS must be embedded in <style>
                        * All code must be self-contained

                        OUTPUT QUALITY:

                        The generated website should be portfolio-worthy and look like a modern commercial product landing page rather than a beginner HTML assignment.

                        For every section, generate meaningful content.

                        Features section:
                        - Minimum 6 feature cards

                        Benefits section:
                        - Minimum 4 benefit cards

                        Testimonials section:
                        - Minimum 3 testimonials

                        FAQ section:
                        - Minimum 5 FAQ items

                        Do not leave any section empty.
                        Every section must contain visible content.
                        ADVANCED DESIGN SYSTEM:

Create a visually stunning website that looks like it was designed by a senior product designer.

VISUAL STYLE:

* Premium SaaS aesthetic
* Modern startup landing page
* Elegant gradients
* Glassmorphism where appropriate
* Soft shadows
* Smooth hover interactions
* Large typography
* Spacious layouts
* High visual appeal
* Conversion-focused design

LAYOUT REQUIREMENTS:

* Full-width hero section
* Large headline and supporting text
* Primary CTA button
* Secondary CTA button
* Feature cards in responsive grid
* Benefit cards with icons/placeholders
* Testimonial cards
* FAQ accordion-style layout
* Modern footer with multiple columns

CONTENT QUALITY:

* Write realistic marketing copy
* Use persuasive headlines
* Use professional subheadings
* Use meaningful feature descriptions
* Avoid lorem ipsum
* Avoid generic filler text

SPACING REQUIREMENTS:

* Use generous whitespace
* Maintain strong visual hierarchy
* Ensure every section feels balanced
* Avoid cramped layouts

RESPONSIVENESS:

* Mobile responsive
* Tablet responsive
* Desktop responsive

HTML REQUIREMENTS:

* Use modern semantic HTML5
* Use CSS custom properties where appropriate
* Use CSS Grid and Flexbox
* Use smooth transitions
* Use modern button styles
* Use modern card styles

IMPORTANT:

Every navigation link must point to an existing section.

Every section must contain visible content.

Avoid empty sections.

Avoid excessive blank space.

Generate a website that looks suitable for a real startup launch.


DESIGN TOKENS:

- Use a modern color system
- Define CSS variables in :root
- Use consistent spacing scale
- Use consistent border radius
- Use consistent shadows
- Use consistent typography scale

Use CSS variables defined in :root for colors, spacing and typography.

HERO SECTION REQUIREMENTS:

- Large bold headline
- Supporting description
- Primary CTA button
- Secondary CTA button
- Trust indicators
- Modern gradient background
- Strong visual impact above the fold

CARD DESIGN REQUIREMENTS:

- Glassmorphism or elevated card style
- Rounded corners
- Hover effects
- Soft shadows
- Consistent spacing
- Modern SaaS appearance


NAVIGATION REQUIREMENTS:

- Sticky navigation bar
- Smooth scrolling
- Active hover states
- CTA button in navbar

MICRO INTERACTIONS:

- Smooth hover transitions
- Button hover effects
- Card hover effects
- Section fade-in styling using CSS


                        Return only valid HTML
    """