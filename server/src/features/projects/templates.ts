// server/src/features/projects/templates.ts

export const PORTFOLIO_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Carter | Creative Developer & UX Architect</title>
  <style>
    :root {
      --primary: #8b5cf6;
      --primary-dark: #6d28d9;
      --accent: #d4ff57;
      --bg: #0b0a0f;
      --surface: #14121a;
      --surface-2: #1e1b29;
      --border: rgba(139, 92, 246, 0.15);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --radius: 16px;
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Navbar styling */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      background: rgba(11, 10, 15, 0.75);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 8%;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo span {
      color: var(--accent);
    }

    .nav-links {
      display: flex;
      gap: 32px;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover {
      color: #fff;
    }

    .nav-btn {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid var(--primary);
      color: var(--text);
      padding: 10px 20px;
      border-radius: var(--radius);
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.3s;
      text-decoration: none;
    }

    .nav-btn:hover {
      background: var(--primary);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
    }

    /* Hero styling */
    .hero {
      position: relative;
      padding: 180px 8% 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-height: 90vh;
      justify-content: center;
      background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
    }

    .hero-badge {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #c084fc;
      margin-bottom: 24px;
      text-transform: uppercase;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 800;
      line-height: 1.1;
      max-width: 900px;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #fff 30%, var(--primary) 70%, var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.25rem;
      color: var(--text-muted);
      max-width: 600px;
      margin-bottom: 40px;
    }

    .hero-btns {
      display: flex;
      gap: 20px;
    }

    .btn-main {
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 14px 28px;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-main:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.35);
    }

    .btn-sec {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 28px;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .btn-sec:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    /* Core Expertise (Features) */
    .features {
      padding: 100px 8%;
      background: #0f0e15;
    }

    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .section-header p {
      color: var(--text-muted);
      font-size: 1.1rem;
      max-width: 500px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 40px 30px;
      border-radius: var(--radius);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: rgba(139, 92, 246, 0.4);
      background: var(--surface-2);
      box-shadow: var(--shadow);
    }

    .feature-card .icon-wrapper {
      width: 50px;
      height: 50px;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      color: var(--primary);
    }

    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .feature-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* Philosophy (Benefits) */
    .benefits {
      padding: 100px 8%;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 30px;
    }

    .benefit-card {
      background: linear-gradient(180deg, var(--surface) 0%, rgba(20, 18, 26, 0.5) 100%);
      border: 1px solid var(--border);
      padding: 30px;
      border-radius: var(--radius);
      text-align: left;
    }

    .benefit-card .num {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 16px;
      opacity: 0.8;
    }

    .benefit-card h3 {
      font-size: 1.25rem;
      margin-bottom: 12px;
    }

    .benefit-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* Testimonials */
    .testimonials {
      padding: 100px 8%;
      background: #0f0e15;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .testimonial-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 30px;
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .testimonial-card p {
      font-style: italic;
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 24px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar {
      width: 44px;
      height: 44px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
    }

    .author-details h4 {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .author-details span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* FAQ accordion */
    .faq {
      padding: 100px 8%;
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-list {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    details {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: all 0.3s;
    }

    details[open] {
      border-color: var(--primary);
      background: var(--surface-2);
    }

    summary {
      padding: 24px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::after {
      content: "+";
      font-size: 1.5rem;
      color: var(--primary);
      transition: transform 0.3s;
    }

    details[open] summary::after {
      content: "-";
      transform: rotate(90deg);
    }

    .faq-answer {
      padding: 0 24px 24px;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* Contact form styling */
    .contact {
      padding: 100px 8%;
      background: #0f0e15;
    }

    .contact-container {
      max-width: 600px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 40px;
      border-radius: var(--radius);
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
    }

    .form-group input, .form-group textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      padding: 14px;
      border-radius: 12px;
      color: #fff;
      font-family: var(--font);
      font-size: 0.95rem;
      transition: border-color 0.3s;
    }

    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .contact-btn {
      width: 100%;
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .contact-btn:hover {
      background: var(--primary-dark);
    }

    /* Footer styling */
    footer {
      border-top: 1px solid var(--border);
      padding: 60px 8% 40px;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }

    .footer-links {
      display: flex;
      gap: 30px;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: #fff;
    }

    .copyright {
      color: var(--text-faint);
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      nav {
        padding: 15px 5%;
      }
      .nav-links {
        display: none;
      }
      .hero {
        padding-top: 140px;
      }
      .features, .benefits, .testimonials, .faq, .contact {
        padding: 80px 5%;
      }
      .contact-container {
        padding: 24px;
      }
    }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav data-section-id="navbar">
    <a href="#" class="logo">Alex<span>.</span>Dev</a>
    <ul class="nav-links">
      <li><a href="#features">Expertise</a></li>
      <li><a href="#benefits">Philosophy</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
    <a href="#contact" class="nav-btn">Get In Touch</a>
  </nav>

  <!-- HERO -->
  <section data-section-id="hero" class="hero">
    <div class="hero-badge">Available for freelance</div>
    <h1>Designing & Building <span class="gradient-text">Immersive</span> Digital Products</h1>
    <p>I am a creative full-stack developer specializing in building clean, interactive websites and UI architectures.</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-main">Hire Me Now &rarr;</a>
      <a href="#features" class="btn-sec">View Work</a>
    </div>
  </section>

  <!-- FEATURES (Expertise) -->
  <section data-section-id="features" class="features" id="features">
    <div class="section-header">
      <h2>Core Expertise</h2>
      <p>Here are the primary technologies and workflows I specialize in to bring ideas to life.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        </div>
        <h3>Frontend Architectures</h3>
        <p>Building highly performant, responsive web interfaces using modern frameworks, semantic HTML, and custom styling systems.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <h3>Backend Integration</h3>
        <p>Developing secure, scalable REST/GraphQL APIs and server logic using Node.js, Express, and modern databases.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M12 7v5l3 3"/></svg>
        </div>
        <h3>Performance Optimization</h3>
        <p>Ensuring ultra-fast page load speeds, SEO optimization, responsive images, and optimal clean code delivery.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <h3>Interactive UI Design</h3>
        <p>Designing interfaces that feel alive, using smooth CSS animations, modern hover transitions, and dark modes.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        </div>
        <h3>Database Engineering</h3>
        <p>Structuring clean schemas, triggers, and migrations with PostgreSQL, SQLite, and admin controls.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3>Automation Pipelines</h3>
        <p>Setting up GitHub Actions, automated unit test configurations, and fast static deployment flows.</p>
      </div>
    </div>
  </section>

  <!-- BENEFITS -->
  <section data-section-id="benefits" class="benefits" id="benefits">
    <div class="section-header">
      <h2>My Philosophy</h2>
      <p>I operate on three core principles to deliver clean results on every single project.</p>
    </div>
    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="num">01</div>
        <h3>Pixel Perfect Design</h3>
        <p>Every pixel is meticulously laid out. Colors, margins, and borders are aligned perfectly to maintain aesthetic harmony.</p>
      </div>
      <div class="benefit-card">
        <div class="num">02</div>
        <h3>Squeaky Clean Code</h3>
        <p>No messy structures or boilerplate left behind. Clean, readable code ensures that projects are easy to maintain and scale.</p>
      </div>
      <div class="benefit-card">
        <div class="num">03</div>
        <h3>User Centric Focus</h3>
        <p>A web product should be easy and natural to navigate. User experience is never sacrificed for layout gimmicks.</p>
      </div>
      <div class="benefit-card">
        <div class="num">04</div>
        <h3>Responsive Delivery</h3>
        <p>From tiny mobile displays to massive ultrawide monitors, websites are coded fluidly to look outstanding on every screen.</p>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section data-section-id="testimonials" class="testimonials" id="testimonials">
    <div class="section-header">
      <h2>Kind Words</h2>
      <p>Here is what clients and designers say about collaborating with me.</p>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p>"Alex delivered our portfolio website ahead of schedule. The responsiveness and animation layout were extremely premium. Our team was wowed at first glance!"</p>
        <div class="author-info">
          <div class="avatar">SC</div>
          <div class="author-details">
            <h4>Sarah Connor</h4>
            <span>Product Manager, Vercel</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"The clean code structures Alex builds makes standard API integrations effortless. Extremely structured developer with a sharp eye for visual layouts."</p>
        <div class="author-info">
          <div class="avatar">JH</div>
          <div class="author-details">
            <h4>John Hill</h4>
            <span>Senior Dev, Linear</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"Exceptional communication, clean interfaces, and brilliant responsive layouts. Highly recommended for any product looking to elevate their digital UI design."</p>
        <div class="author-info">
          <div class="avatar">ME</div>
          <div class="author-details">
            <h4>Mia Evans</h4>
            <span>Creative Director, Stripe</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section data-section-id="faq" class="faq" id="faq">
    <div class="section-header">
      <h2>FAQ</h2>
      <p>Answers to common questions regarding timelines, technologies, and workflow.</p>
    </div>
    <div class="faq-list">
      <details>
        <summary>What is your typical project timeline?</summary>
        <div class="faq-answer">
          Depending on scope, custom creative websites are generally delivered in 2-3 weeks, including design alignment, coding, and revisions.
        </div>
      </details>
      <details>
        <summary>Which tech stack do you prefer?</summary>
        <div class="faq-answer">
          I prefer writing clean HTML, CSS, JavaScript, React, Svelte, and Node.js for backend APIs, along with responsive styling protocols.
        </div>
      </details>
      <details>
        <summary>Do you offer post-launch maintenance?</summary>
        <div class="faq-answer">
          Yes! I provide monthly support options to keep your dependencies updated, ensure pages load quickly, and handle minor edits.
        </div>
      </details>
      <details>
        <summary>How do you approach mobile responsiveness?</summary>
        <div class="faq-answer">
          I design mobile-first. Layouts are tested extensively across multiple device frames to guarantee visual excellence on all devices.
        </div>
      </details>
      <details>
        <summary>Can you work with existing design files?</summary>
        <div class="faq-answer">
          Absolutely. I can take Figma, Sketch, or Adobe XD designs and convert them into interactive, lightweight frontend code.
        </div>
      </details>
    </div>
  </section>

  <!-- CONTACT -->
  <section data-section-id="contact" class="contact" id="contact">
    <div class="section-header">
      <h2>Start A Project</h2>
      <p>Have an idea or project in mind? Shoot me a message and let's build something epic.</p>
    </div>
    <div class="contact-container">
      <form onsubmit="event.preventDefault(); alert('Message sent successfully!');">
        <div class="form-group">
          <label for="name">Your Name</label>
          <input type="text" id="name" required placeholder="John Doe">
        </div>
        <div class="form-group">
          <label for="email">Your Email</label>
          <input type="email" id="email" required placeholder="john@example.com">
        </div>
        <div class="form-group">
          <label for="message">Project Description</label>
          <textarea id="message" rows="5" required placeholder="Describe your project requirements..."></textarea>
        </div>
        <button type="submit" class="contact-btn">Send Message</button>
      </form>
    </div>
  </section>

  <!-- FOOTER -->
  <footer data-section-id="footer">
    <div class="footer-links">
      <a href="#features">Expertise</a>
      <a href="#benefits">Philosophy</a>
      <a href="#testimonials">Testimonials</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="copyright">&copy; 2026 Alex Carter. All rights reserved. Custom built.</div>
  </footer>

</body>
</html>`;

export const LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaSFlow | Automated Workflows with Intelligent Analytics</title>
  <style>
    :root {
      --primary: #10b981;
      --primary-dark: #059669;
      --accent: #06b6d4;
      --bg: #030712;
      --surface: #111827;
      --surface-2: #1f2937;
      --border: rgba(16, 185, 129, 0.15);
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --radius: 12px;
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Navbar styling */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 100;
      background: rgba(3, 7, 18, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 8%;
    }

    .logo {
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .logo span {
      color: var(--primary);
    }

    .nav-links {
      display: flex;
      gap: 28px;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover {
      color: var(--primary);
    }

    .nav-btn {
      background: var(--primary);
      color: #fff;
      padding: 8px 18px;
      border-radius: var(--radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s;
      text-decoration: none;
      border: none;
    }

    .nav-btn:hover {
      background: var(--primary-dark);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    /* Hero styling */
    .hero {
      position: relative;
      padding: 160px 8% 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-height: 85vh;
      justify-content: center;
      background: radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 60%);
    }

    .hero-tag {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .hero h1 {
      font-size: clamp(2.2rem, 5.5vw, 4rem);
      font-weight: 800;
      line-height: 1.15;
      max-width: 900px;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary) 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 580px;
      margin-bottom: 35px;
    }

    .hero-btns {
      display: flex;
      gap: 16px;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.3s;
      text-decoration: none;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text);
      padding: 12px 24px;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.3s;
      text-decoration: none;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-1px);
    }

    /* Features Section */
    .features {
      padding: 90px 8%;
      background: #090d16;
    }

    .section-header {
      text-align: center;
      margin-bottom: 50px;
    }

    .section-header h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }

    .section-header p {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 480px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 35px 25px;
      border-radius: var(--radius);
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.4);
      background: var(--surface-2);
      box-shadow: var(--shadow);
    }

    .feature-card .icon {
      width: 46px;
      height: 46px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      color: var(--primary);
    }

    .feature-card h3 {
      font-size: 1.2rem;
      margin-bottom: 12px;
      font-weight: 700;
    }

    .feature-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Benefits Section */
    .benefits {
      padding: 90px 8%;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }

    .benefit-card {
      background: rgba(17, 24, 39, 0.6);
      border: 1px solid var(--border);
      padding: 24px;
      border-radius: var(--radius);
    }

    .benefit-card .stat {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 10px;
    }

    .benefit-card h3 {
      font-size: 1.15rem;
      margin-bottom: 10px;
    }

    .benefit-card p {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    /* Testimonials Section */
    .testimonials {
      padding: 90px 8%;
      background: #090d16;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .testimonial-card {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 28px;
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .testimonial-card p {
      color: var(--text);
      font-size: 0.9rem;
      line-height: 1.65;
      margin-bottom: 20px;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author .initials {
      width: 38px;
      height: 38px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: #fff;
    }

    .author-info h4 {
      font-size: 0.85rem;
      font-weight: 600;
    }

    .author-info span {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* FAQ Section */
    .faq {
      padding: 90px 8%;
      max-width: 760px;
      margin: 0 auto;
    }

    .faq-list {
      margin-top: 35px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    details {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    details[open] {
      border-color: var(--primary);
    }

    summary {
      padding: 20px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::after {
      content: "+";
      font-size: 1.3rem;
      color: var(--primary);
    }

    details[open] summary::after {
      content: "-";
    }

    .faq-answer {
      padding: 0 20px 20px;
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Contact/CTA Form */
    .contact {
      padding: 90px 8%;
      background: #090d16;
    }

    .contact-container {
      max-width: 540px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 35px;
      border-radius: var(--radius);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
    }

    .form-group input {
      width: 100%;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 8px;
      color: #fff;
      font-family: var(--font);
      font-size: 0.9rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .contact-btn {
      width: 100%;
      background: var(--primary);
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .contact-btn:hover {
      background: var(--primary-dark);
    }

    /* Footer Section */
    footer {
      border-top: 1px solid var(--border);
      padding: 50px 8% 30px;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 25px;
    }

    .footer-links {
      display: flex;
      gap: 24px;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    .copyright {
      color: var(--text-muted);
      font-size: 0.75rem;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      nav {
        padding: 15px 5%;
      }
      .nav-links {
        display: none;
      }
      .hero {
        padding-top: 130px;
      }
      .features, .benefits, .testimonials, .faq, .contact {
        padding: 70px 5%;
      }
      .contact-container {
        padding: 24px;
      }
    }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav data-section-id="navbar">
    <a href="#" class="logo">SaaS<span>Flow</span></a>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#benefits">Analytics</a></li>
      <li><a href="#testimonials">Reviews</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
    <a href="#contact" class="nav-btn">Start Free Trial</a>
  </nav>

  <!-- HERO -->
  <section data-section-id="hero" class="hero">
    <div class="hero-tag">Intelligent Workflow Automation</div>
    <h1>Scale Business Operations With <span class="gradient-text">AI Automation</span></h1>
    <p>SaaSFlow connects with all your developer tools, databases, and services to automate complex logic securely.</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-primary">Get Started Now</a>
      <a href="#features" class="btn-secondary">Explore Features</a>
    </div>
  </section>

  <!-- FEATURES -->
  <section data-section-id="features" class="features" id="features">
    <div class="section-header">
      <h2>Automate Anything</h2>
      <p>A look at the primary integration and serverless components inside SaaSFlow.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3>Instant API Sync</h3>
        <p>Connect endpoints automatically with secure JWT handling and real-time event updates.</p>
      </div>
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/></svg>
        </div>
        <h3>Predictive Analytics</h3>
        <p>Generate data reports instantly using built-in mathematical models and trends charts.</p>
      </div>
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3>Enterprise Security</h3>
        <p>End-to-end data encryption ensures your sensitive customer metrics are protected at all times.</p>
      </div>
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
        </div>
        <h3>Serverless Scaling</h3>
        <p>No servers to manage. SaaSFlow scales resources up or down dynamically depending on traffic requests.</p>
      </div>
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17m-.001-4v4h4"/></svg>
        </div>
        <h3>Live Event Logs</h3>
        <p>Track execution logs via structured streams to debug complex setups in real-time.</p>
      </div>
      <div class="feature-card">
        <div class="icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </div>
        <h3>Team Collaboration</h3>
        <p>Invite engineers, designers, and managers to view analytics dashboards and edit templates.</p>
      </div>
    </div>
  </section>

  <!-- BENEFITS -->
  <section data-section-id="benefits" class="benefits" id="benefits">
    <div class="section-header">
      <h2>SaaSFlow by the Numbers</h2>
      <p>Key efficiency metrics achieved by organizations integrating automated pipelines.</p>
    </div>
    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="stat">99.9%</div>
        <h3>System Uptime</h3>
        <p>Enterprise server infrastructure handles high concurrent events without database locks.</p>
      </div>
      <div class="benefit-card">
        <div class="stat">10x</div>
        <h3>Faster Deployment</h3>
        <p>Save hours of backend logic building. Set up complex data actions in minutes.</p>
      </div>
      <div class="benefit-card">
        <div class="stat">0%</div>
        <h3>Server Overhead</h3>
        <p>Forget standard provisioning, updates, and scalability issues. Everything scales serverless.</p>
      </div>
      <div class="benefit-card">
        <div class="stat">8s</div>
        <h3>Build Speeds</h3>
        <p>Dynamic page rendering outputs static code bundles and assets near-instantly.</p>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section data-section-id="testimonials" class="testimonials" id="testimonials">
    <div class="section-header">
      <h2>Loved by Developers</h2>
      <p>Hear from team leaders who accelerated their growth using SaaSFlow.</p>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p>"Integrating SaaSFlow allowed us to scale our data sync flow to 100k events/sec. The dashboard UI makes monitoring effortless."</p>
        <div class="author">
          <div class="initials">MA</div>
          <div class="author-info">
            <h4>Marc Andre</h4>
            <span>Tech Director, Supabase</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"We replaced multiple custom cron services with SaaSFlow pipelines. Build error rates plummeted, and database scaling is now zero-stress."</p>
        <div class="author">
          <div class="initials">EL</div>
          <div class="author-info">
            <h4>Emily Lewis</h4>
            <span>Lead Architect, Figma</span>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p>"Outstanding analytics layout, lightweight responsive assets, and incredibly responsive interfaces. Our workflow is 10x faster."</p>
        <div class="author">
          <div class="initials">DK</div>
          <div class="author-info">
            <h4>David K.</h4>
            <span>VP of Engineering, Stripe</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section data-section-id="faq" class="faq" id="faq">
    <div class="section-header">
      <h2>Frequently Asked Questions</h2>
      <p>Clear, direct answers regarding templates, billing, and system limits.</p>
    </div>
    <div class="faq-list">
      <details>
        <summary>How does the 14-day free trial work?</summary>
        <div class="faq-answer">
          You receive complete API access and 500 automation runs. No credit card is required to set up your account.
        </div>
      </details>
      <details>
        <summary>Can I download the raw HTML code?</summary>
        <div class="faq-answer">
          Yes! You can export full static files (HTML/CSS) with a single click from the editor toolbar.
        </div>
      </details>
      <details>
        <summary>Is there an active limit on team members?</summary>
        <div class="faq-answer">
          The Starter plan includes up to 5 collaborators, while the Enterprise tier allows unlimited seats.
        </div>
      </details>
      <details>
        <summary>What databases do you support?</summary>
        <div class="faq-answer">
          We integrate directly with PostgreSQL, Supabase databases, MongoDB, MySQL, and DynamoDB.
        </div>
      </details>
      <details>
        <summary>How secure is client data?</summary>
        <div class="faq-answer">
          Data is fully encrypted using AES-256 standard protocols both in transit and at rest.
        </div>
      </details>
    </div>
  </section>

  <!-- CONTACT -->
  <section data-section-id="contact" class="contact" id="contact">
    <div class="section-header">
      <h2>Get Started Today</h2>
      <p>Join thousands of teams scaling their automated workflows. Create your free account.</p>
    </div>
    <div class="contact-container">
      <form onsubmit="event.preventDefault(); alert('Account created successfully!');">
        <div class="form-group">
          <label for="company">Company Name</label>
          <input type="text" id="company" required placeholder="Acme Inc">
        </div>
        <div class="form-group">
          <label for="email">Work Email</label>
          <input type="email" id="email" required placeholder="name@company.com">
        </div>
        <button type="submit" class="contact-btn">Create Free Account</button>
      </form>
    </div>
  </section>

  <!-- FOOTER -->
  <footer data-section-id="footer">
    <div class="footer-links">
      <a href="#features">Features</a>
      <a href="#benefits">Analytics</a>
      <a href="#testimonials">Reviews</a>
      <a href="#faq">FAQ</a>
    </div>
    <div class="copyright">&copy; 2026 SaaSFlow Inc. All rights reserved. Built for creators.</div>
  </footer>

</body>
</html>`;
