const { useState, useEffect, useRef } = React;

// Custom Hook for Animations
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isIntersecting];
}

// Hero backdrop: a quiet glow + grain instead of an animated particle field
function HeroBackdrop() {
  return (
    <>
      <div className="hero-glow"></div>
      <div className="hero-grid"></div>
      <div className="hero-grain"></div>
    </>
  );
}

// Hero scene: a slow-turning wireframe icosahedron behind the terminal panel.
// Skipped on touch/narrow screens and under reduced motion to keep things light.
function HeroScene() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const skip =
      !window.THREE ||
      window.matchMedia('(max-width: 899px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) return;

    const THREE = window.THREE;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const accent = new THREE.Color(0x8274f0);

    const core = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.2, 1)),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.6 })
    );
    const halo = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.3, 1)),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.16 })
    );
    const vertices = new THREE.Points(
      new THREE.IcosahedronGeometry(2.2, 1),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.75 })
    );
    scene.add(core, halo, vertices);

    let frame = null;
    let targetX = 0, targetY = 0;

    const onMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      core.rotation.y = t * 0.14;
      core.rotation.x = Math.sin(t * 0.2) * 0.2;
      halo.rotation.copy(core.rotation);
      vertices.rotation.copy(core.rotation);

      camera.position.x += (targetX * 0.7 - camera.position.x) * 0.045;
      camera.position.y += (-targetY * 0.5 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && frame === null) {
        render();
      } else if (!entry.isIntersecting && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }, { threshold: 0.05 });
    io.observe(container);

    return () => {
      io.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="hero-scene" ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

// Magnetic hover: nudges buttons/icons toward the cursor, eases back on leave
function useMagnetic(selector, strength = 0.3) {
  useEffect(() => {
    if (!window.gsap || window.matchMedia('(pointer: coarse)').matches) return;
    const gsap = window.gsap;
    const els = Array.from(document.querySelectorAll(selector));

    const cleanups = els.map((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });

      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      };
      const onLeave = () => { xTo(0); yTo(0); };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector, strength]);
}

// Typewriter cycle: types a word, pauses, deletes it, moves to the next.
// Falls back to the first word, static, under reduced motion.
function useTypewriterCycle(words, { typeSpeed = 55, deleteSpeed = 30, pause = 1600 } = {}) {
  const [text, setText] = useState(words[0] || '');

  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(words[0] || '');
      return;
    }

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = false;
    let timer = null;

    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex += 1;
        setText(word.slice(0, charIndex));
        if (charIndex >= word.length) {
          deleting = true;
          timer = setTimeout(tick, pause);
          return;
        }
        timer = setTimeout(tick, typeSpeed);
      } else {
        charIndex -= 1;
        setText(word.slice(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          timer = setTimeout(tick, 300);
          return;
        }
        timer = setTimeout(tick, deleteSpeed);
      }
    };

    timer = setTimeout(tick, pause);
    return () => clearTimeout(timer);
  }, [words, typeSpeed, deleteSpeed, pause]);

  return text;
}

// Custom Cursor Component
function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    cursor.style.opacity = "0";

    const moveCursor = (e) => {
      cursor.style.opacity = "1";
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const growCursor = () => cursor.classList.add('cursor-grow');
    const shrinkCursor = () => cursor.classList.remove('cursor-grow');

    document.addEventListener('mousemove', moveCursor);

    const links = document.querySelectorAll('a, button, .project-card, .skill-badge');
    links.forEach(link => {
      link.addEventListener('mouseenter', growCursor);
      link.addEventListener('mouseleave', shrinkCursor);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      links.forEach(link => {
        link.removeEventListener('mouseenter', growCursor);
        link.removeEventListener('mouseleave', shrinkCursor);
      });
    };
  }, []);

  return <div ref={cursorRef} id="cursor"></div>;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="#hero" className="logo">
          <svg className="logo-mark" width="22" height="22" viewBox="0 0 512 512" aria-hidden="true">
            <rect width="512" height="512" rx="112" fill="#0D1117" />
            <text x="256" y="312" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" fontSize="160" fontWeight="700">
              <tspan fill="#8B7CFF">{'{'}</tspan><tspan fill="#E6EDF3">fy</tspan><tspan fill="#8B7CFF">{'}'}</tspan>
            </text>
          </svg>
          ferrin.y
        </a>

        <div className="menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a></li>
          <li><a href="#projects" onClick={() => setMobileMenuOpen(false)}>Projects</a></li>
          <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
          <li><a href="https://github.com/Ferrin-Y" target="_blank" rel="noopener noreferrer" className="btn btn-ghost navbar-cta">GitHub</a></li>
        </ul>
      </div>
    </nav>
  );
}

const ROLE_WORDS = ["CS Student", "Builder", "Problem Solver", "Lifelong Learner"];

// Hero Section
function Hero() {
  const role = useTypewriterCycle(ROLE_WORDS);
  const pillRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const actionsRef = useRef(null);
  const panelRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const targets = [pillRef, titleRef, subtitleRef, actionsRef, panelRef, sceneRef]
      .map((r) => r.current)
      .filter(Boolean);

    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const gsap = window.gsap;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(pillRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 })
      .fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
      .fromTo(subtitleRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.45')
      .fromTo(actionsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.4')
      .fromTo(panelRef.current, { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, '-=0.5')
      .fromTo(sceneRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 }, '-=0.9');

    return () => tl.kill();
  }, []);

  return (
    <section className="hero" id="hero">
      <HeroBackdrop />
      <div className="hero-scene-wrap" ref={sceneRef}>
        <HeroScene />
      </div>
      <div className="hero-container">
        <div className="hero-copy">
          <div className="status-pill" ref={pillRef}>
            <span className="status-dot"></span>
            open to new opportunities
          </div>

          <h1 className="title" ref={titleRef}>
            <span className="line-muted">Computer science student</span>
            <span className="line-bold">who builds software that holds up.</span>
          </h1>

          <p className="subtitle" ref={subtitleRef}>
            I care about clarity and structure, writing code that's reliable now
            and easy to extend later.
          </p>

          <div className="hero-actions" ref={actionsRef}>
            <a href="#projects" className="btn btn-primary">View projects</a>
            <a href="#contact" className="btn btn-ghost">Get in touch</a>
          </div>
        </div>

        <div className="terminal-panel" ref={panelRef}>
          <div className="terminal-header">
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <span className="terminal-title">profile.json</span>
          </div>
          <div className="terminal-body">
            <div><span className="prompt">$</span> <span className="command">cat profile.json</span></div>
            <div className="terminal-json">{`{
  "name": `}<span className="str">"Ferrin Yesudasan"</span>{`,
  "role": `}<span className="str">{`"${role}"`}</span>{`,
  "stack": [`}<span className="str">"React"</span>{`, `}<span className="str">"Java"</span>{`, `}<span className="str">"Python"</span>{`],
  "location": `}<span className="str">"Hamilton, ON"</span>{`,
  "status": `}<span className="str">"open_to_work"</span>{`
}`}<span className="terminal-cursor"></span></div>
          </div>

          <div className="build-tag">
            <span className="status-dot"></span>
            rebuilt · 2026
          </div>
        </div>
      </div>

      <div className="hero-bottom-bar">
        <span className="hero-bottom-tag">FY / PORTFOLIO</span>
        <a href="#about" className="scroll-cue">
          <i className="fas fa-chevron-down"></i>
          scroll to explore
        </a>
        <a href="mailto:ferrin.yesudasan@gmail.com" className="say-hi">
          say hi
          <i className="fas fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </section>
  );
}

// Skills Modal Component
function SkillsModal({ isOpen, onClose }) {
  const skillCategories = {
    "Programming Languages": ["Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "PHP"],
    "Frontend Development": ["HTML5", "CSS3", "React", "Next.js", "Angular", "jQuery", "JavaFX"],
    "Backend & API Development": ["Node.js", "Express", "Spring Boot", ".NET Core", "Flask", "RESTful APIs"],
    "Database Technologies": ["SQL", "Hibernate"],
    "DevOps & Cloud Tools": ["Git", "Docker", "AWS", "CI/CD"],
    "Development Tools & Environments": ["VS Code", "Visual Studio", "IntelliJ IDEA", "Eclipse", "Linux", "WordPress"],
    "Data Science & Visualization": ["pandas", "NumPy", "Matplotlib", "Data Analysis"],
    "Game & Interactive Media": ["Unity", "Blender3D", "Game Design", "3D Modeling"],
    "Software Engineering & Methodologies": ["UI/UX Design", "System Analysis & Design", "Agile Methodologies", "SDLC", "Quality Assurance"],
    "IT Support & Operations": ["Troubleshooting", "Hardware Imaging", "Customer Support", "Technical Support"],
    "Application Suites": ["Microsoft Office", "Micrsoft Enterprise", "Adobe Creative Cloud"],
    "Soft Skills": ["Problem Solving", "Team Collaboration", "Communication", "Adaptability", "Project Management", "Leadership", "Time Management"]
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Technical Skills</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">
          {Object.entries(skillCategories).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <h3>{category}</h3>
              <div className="skill-tags">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag-modal">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// About Section with Modal
function About() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const specs = [
    { label: "FOCUS", value: "Full-stack apps & backend systems" },
    { label: "STACK", value: "JS/TS, Java, Python, C#" },
    { label: "BASED IN", value: "Hamilton, Ontario" },
    { label: "STATUS", value: "Open to opportunities" }
  ];

  return (
    <>
      <section className="about" id="about">
        <div className="container">
          <div className="eyebrow"><span className="chevron">▸</span> ABOUT</div>
          <h2 className="section-heading">A little about me</h2>

          <div
            className="about-grid"
            ref={ref}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}
          >
            <div className="about-text">
              <p>
                I'm a software developer who values <strong>clarity and structure</strong>.
                I like understanding how things actually work before I build on top of
                them, and I'd rather ship something smaller and solid than something
                large and shaky.
              </p>
              <p>
                Most of what's below came from wanting to learn something specific,
                like async pipelines, AI integrations, or dependency graphs, and then
                building the smallest real version of it I could.
              </p>
              <div className="about-cta">
                <button className="btn btn-ghost view-all-skills" onClick={() => setIsModalOpen(true)}>
                  View full stack ▸
                </button>
              </div>
            </div>

            <div className="spec-panel">
              {specs.map((spec) => (
                <div className="spec-row" key={spec.label}>
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SkillsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

// Projects Section
function Projects() {
  const projects = [
    {
      title: "Conduit",
      eyebrow: "Backend · RAG pipeline",
      description: "A high-performance, asynchronous document ingestion and semantic search engine. FastAPI accepts documents instantly while a background worker pool handles chunking, embedding, and indexing for retrieval.",
      url: "https://github.com/Ferrin-Y/Conduit",
      icon: "fa-diagram-project",
      tags: ["Python", "FastAPI", "PostgreSQL", "ChromaDB", "Docker"],
      isNew: true,
      featured: true
    },
    {
      title: "Glean",
      eyebrow: "Full-stack · AI",
      description: "An AI-powered bookmark manager that auto-tags, summarizes, and organizes saved links, with full-text search and collections built on Next.js and Supabase.",
      url: "https://github.com/Ferrin-Y/glean",
      icon: "fa-bookmark",
      tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
      isNew: true
    },
    {
      title: "Arboris",
      eyebrow: "CLI tool",
      description: "A fast command-line tool that parses source with tree-sitter and maps what imports what across large repos, exporting the result as Markdown, Mermaid, Graphviz, or an interactive terminal explorer.",
      url: "https://github.com/Ferrin-Y/Arboris",
      icon: "fa-sitemap",
      tags: ["Python", "Rust", "tree-sitter"],
      isNew: true
    },
    {
      title: "Space Shooter Game",
      eyebrow: "Game",
      description: "A space-shooter game made using JavaScript and SVG with smooth animations and interactive controls.",
      url: "https://ferrin-y.github.io/Space-Shooter/",
      image: "images/screenshots/space-shooter.png",
      tags: ["JavaScript", "SVG"]
    },
    {
      title: "Color Matching Game",
      eyebrow: "Full-stack · Game",
      description: "A full-stack color-matching game, built with HTML, CSS, JavaScript, and powered by a Node.js & Express backend.",
      url: "https://ferrin-y.github.io/Color-Match/",
      image: "images/screenshots/color-matcher.png",
      tags: ["JavaScript", "Node.js", "Express", "SVG"]
    },
    {
      title: "MoInfo Study Group App",
      eyebrow: "Web app",
      description: "A web application to help students create and find study groups for better collaborative learning.",
      url: "https://github.com/Musa-Kal/MoInfo",
      image: "images/screenshots/mo-info.png",
      tags: ["HTML5", "CSS3", "Flask"]
    },
    {
      title: "Mooove - 3D Runner Game",
      eyebrow: "Game · Unity",
      description: "A Unity-based endless rolling game with dynamic obstacles and scoring system, hosted on itch.io.",
      url: "https://ferrin-y.itch.io/mooove",
      image: "images/screenshots/mooove.png",
      tags: ["Unity", "C#", "Blender3D"]
    },
    {
      title: "CookApp - Recipe Suggestion App",
      eyebrow: "Desktop app",
      description: "A Java based application that helps users discover and favorite recipes based on ingredients, dietary preferences, and cuisine.",
      url: "https://github.com/Ferrin-Y/CookApp",
      image: "images/screenshots/cookApp.png",
      tags: ["Java", "JavaFX", "MySQL", "Hibernate"]
    },
    {
      title: "Book Discovery Expo App",
      eyebrow: "Mobile",
      description: "A React Native mobile application that allows users to search, browse, and save their favorite books using the Google Books API.",
      url: "https://github.com/Ferrin-Y/google-books-app",
      image: "images/screenshots/google-books.png",
      tags: ["React Native", "Expo", "Google Books API"]
    }
  ];

  const trackRef = useRef(null);
  const fillRef = useRef(null);
  const [hoverScroll, setHoverScroll] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setHoverScroll(pointerQuery.matches && !motionQuery.matches);
    update();
    pointerQuery.addEventListener('change', update);
    motionQuery.addEventListener('change', update);
    return () => {
      pointerQuery.removeEventListener('change', update);
      motionQuery.removeEventListener('change', update);
    };
  }, []);

  // Progress fill tracks the rail's scroll position regardless of input method
  // (wheel redirect below, native trackpad swipe, touch, or dragging the scrollbar).
  useEffect(() => {
    const track = trackRef.current;
    const viewport = track && track.parentElement;
    if (!viewport) return;

    const onScroll = () => {
      const max = track.scrollWidth - viewport.clientWidth;
      if (fillRef.current) fillRef.current.style.width = `${max > 0 ? (viewport.scrollLeft / max) * 100 : 0}%`;
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  // While the cursor is over the rail, redirect vertical wheel input into horizontal
  // scroll — but only while there's more rail left to cover. At either end, or with
  // the cursor anywhere else on the page, the page just scrolls normally.
  useEffect(() => {
    if (!hoverScroll) return;
    const track = trackRef.current;
    const viewport = track && track.parentElement;
    if (!viewport) return;

    let target = viewport.scrollLeft;
    let raf = null;

    const settle = () => {
      const current = viewport.scrollLeft;
      const next = current + (target - current) * 0.18;
      if (Math.abs(target - next) > 0.5) {
        viewport.scrollLeft = next;
        raf = requestAnimationFrame(settle);
      } else {
        viewport.scrollLeft = target;
        raf = null;
      }
    };

    const onWheel = (e) => {
      if (raf === null) target = viewport.scrollLeft;
      const max = track.scrollWidth - viewport.clientWidth;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if ((delta > 0 && target >= max - 1) || (delta < 0 && target <= 1)) {
        return; // already at an edge in this direction — let the page scroll instead
      }

      e.preventDefault();
      target = Math.min(max, Math.max(0, target + delta));
      if (raf === null) raf = requestAnimationFrame(settle);
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', onWheel);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [hoverScroll]);

  return (
    <section className="projects-scroll-wrap" id="projects">
      <div className="projects-sticky">
        <div className="projects-intro">
          <div className="eyebrow"><span className="chevron">▸</span> PROJECTS</div>
          <h2 className="section-heading">Selected work</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            Things I've built, from async AI pipelines to small games{hoverScroll ? ". Scroll over the rail to move through them" : ""}.
          </p>
          <div className="project-progress">
            <div className="project-progress-fill" ref={fillRef}></div>
          </div>
        </div>

        <div className="project-track-viewport">
          <div className="project-track" ref={trackRef}>
            {projects.map((project, index) => (
              <a
                key={index}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={`project-media ${!project.image ? 'icon-tile' : ''}`}>
                  {project.image ? (
                    <img src={project.image} alt={project.title} loading="lazy" />
                  ) : (
                    <i className={`fas ${project.icon}`}></i>
                  )}
                </div>

                <div className="project-top">
                  <span className="project-eyebrow">
                    {project.eyebrow}{project.isNew && <span className="new-tag"> · new</span>}
                  </span>
                  <i className="fas fa-arrow-up-right-from-square project-link-icon"></i>
                </div>

                <h3>{project.title}</h3>
                <div className="project-description">{project.description}</div>
                <div className="project-tags">{project.tags.join(" · ")}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Section
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="eyebrow"><span className="chevron">▸</span> CONTACT</div>
        <h2 className="section-heading">Get in touch</h2>
        <p className="section-sub" style={{ marginBottom: '56px' }}>
          Have a project, an opening, or just want to talk shop? My inbox is open.
        </p>

        <div className="footer-container">
          <div className="footer-col">
            <h3>Ferrin Yesudasan</h3>
            <p className="footer-tagline">
              Computer Science student building full-stack apps, AI-powered tools, and games.
            </p>
            <div className="social-links">
              <a href="https://github.com/Ferrin-Y" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/ferrin-yesudasan" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Navigate</h3>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Elsewhere</h3>
            <div className="contact-info">
              <a href="mailto:ferrin.yesudasan@gmail.com">ferrin.yesudasan@gmail.com</a>
              <a href="https://www.linkedin.com/in/ferrin-yesudasan" target="_blank" rel="noopener noreferrer">LinkedIn / Ferrin-Yesudasan</a>
              <a href="https://github.com/Ferrin-Y" target="_blank" rel="noopener noreferrer">github.com/Ferrin-Y</a>
              <span>Hamilton, Ontario, Canada</span>
            </div>
          </div>
        </div>

        <div className="copyright">
          <span>© {currentYear} Ferrin Yesudasan</span>
          <span>Built with React</span>
        </div>
      </div>
    </footer>
  );
}

// Scroll to top button
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      className="scroll-to-top"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        opacity: isVisible ? '1' : '0',
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'scale(1)' : 'scale(0.85)'
      }}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}

// Main App Component
function App() {
  useMagnetic('.btn, .social-link', 0.25);

  return (
    <>
      <CustomCursor />
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer />
      <ScrollToTop />
    </>
  );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />)
