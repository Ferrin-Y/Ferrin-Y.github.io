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

// Particle Background Component
// Enhanced Particle Background Component
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);

    // Create particles with better visibility
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1.5, // Larger particles
        color: `rgba(118, 94, 222, ${Math.random() * 0.6 + 0.3})`, // Higher opacity
        glowColor: `rgba(156, 138, 247, ${Math.random() * 0.4 + 0.2})`, // Glow effect
        velocity: {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8
        },
        pulse: Math.random() * Math.PI * 2 // For pulsing effect
      });
    }

    function connect() {
      const maxDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 0.4 * (1 - distance / maxDistance);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(118, 94, 222, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x = -particle.velocity.x;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y = -particle.velocity.y;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }
        
        // Update pulse for glow effect
        particle.pulse += 0.02;
        const pulseIntensity = Math.sin(particle.pulse) * 0.3 + 0.7;
        
        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        // Create glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.glowColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw solid center
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(156, 138, 247, ${pulseIntensity})`;
        ctx.fill();
      });
      
      connect();
    }

    animate();

    const handleResize = () => {
      resizeCanvas();
      // Reposition particles that are now outside the canvas
      particles.forEach(particle => {
        if (particle.x > canvas.width) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = canvas.height;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-particles"></canvas>;
}

// Custom Cursor Component
function CustomCursor() {
  const cursorRef = useRef(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    
    // Initially hide the cursor until mouse movement
    cursor.style.opacity = "0";
    
    const moveCursor = (e) => {
      // Show the cursor once movement is detected
      cursor.style.opacity = "1";
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    
    const growCursor = () => {
      cursor.classList.add('cursor-grow');
    };
    
    const shrinkCursor = () => {
      cursor.classList.remove('cursor-grow');
    };
    
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
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="https://github.com/Ferrin-Y" target="_blank" rel="noopener noreferrer" className="logo">
          <i className="fab fa-github"></i>Ferrin-Y
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
        </ul>
      </div>
    </nav>
  );
}

// Hero Section
function Hero() {
  // Typewriter effect for the title
  const [displayText, setDisplayText] = useState("");
  const fullText = "Hi, I'm Ferrin Yesudasan";
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const type = () => {
      // Current text
      const current = fullText.substring(0, index);
      setDisplayText(current);
      
      // If completing
      if (!isDeleting && index === fullText.length) {
        setTimeout(() => setIsDeleting(true), 1500);
        return;
      } 
      
      // If deleting
      if (isDeleting && index === 0) {
        setIsDeleting(false);
        setTimeout(() => {}, 500);
        return;
      }
      
      // Speed settings
      const speed = isDeleting ? 75 : typingSpeed;
      
      // Next timeout
      const timeout = setTimeout(() => {
        setIndex(prevIndex => isDeleting ? prevIndex - 1 : prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    };
    
    type();
  }, [index, isDeleting, fullText, typingSpeed]);

  return (
    <section className="hero" id="hero">
      <ParticleBackground />
      <div className="hero-content">
        <h1 className="title" data-text={displayText}>{displayText}</h1>
        <p className="subtitle">
          I'm a Computer Science student with a strong foundation in software and web development,
          coupled with experience in testing and quality assurance.
        </p>
        <a href="#projects" className="button">View My Work</a>
      </div>
      <div className="scroll-down">
        <a href="#about">
          <i className="fas fa-chevron-down"></i>
        </a>
      </div>
    </section>
  );
}

// Skills Modal Component
function SkillsModal({ isOpen, onClose }) {
  const skillCategories = {
  "Programming Languages": [
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "C++",
    "C#",
    "PHP",
  ],
  "Frontend Development": [
    "HTML5",
    "CSS3",
    "React",
    "Next.js",
    "Angular",
    "jQuery",
    "JavaFX",

  ],
  "Backend & API Development": [
    "Node.js",
    "Express",
    "Spring Boot",
    ".NET Core",
    "Flask",
    "RESTful APIs"
  ],
  "Database Technologies": [
    "SQL",
    "Hibernate"
  ],
  "DevOps & Cloud Tools": [
    "Git",
    "Docker",
    "AWS",
    "CI/CD"
  ],
  "Development Tools & Environments": [
    "VS Code",
    "Visual Studio",
    "IntelliJ IDEA",
    "Eclipse",
    "Linux",
    "WordPress"
  ],
  "Data Science & Visualization": [
    "pandas",
    "NumPy",
    "Matplotlib",
    "Data Analysis"
  ],
  "Game & Interactive Media": [
    "Unity",
    "Blender3D",
    "Game Design",
    "3D Modeling"
  ],
  "Software Engineering & Methodologies": [
    "UI/UX Design",
    "System Analysis & Design",
    "Agile Methodologies",
    "SDLC",
    "Quality Assurance",
  ],
  "IT Support & Operations": [
    "Troubleshooting",
    "Hardware Imaging",
    "Customer Support",
    "Technical Support"
  ],
  "Application Suites": [
    "Microsoft Office",
    "Micrsoft Enterprise",
    "Adobe Creative Cloud"
  ],
  "Soft Skills": [
    "Problem Solving",
    "Team Collaboration",
    "Communication",
    "Adaptability",
    "Project Management",
    "Leadership",
    "Time Management"
  ]
};

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore background scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        // Ensure modal is properly positioned and prevents interaction with background
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto', // Allow scrolling if modal is taller than viewport
        padding: '20px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgb(19, 19, 47) 0%, #1a1a3a 100%)',
          borderRadius: '20px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: 'calc(100vh - 40px)', // Ensure modal fits in viewport
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(156, 138, 247, 0.3)',
          position: 'relative'
        }}
      >
        <div className="modal-header">
          <h2>Technical Skills</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#f0f2ff',
              fontSize: '2em',
              cursor: 'pointer',
              padding: 0,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.3s ease'
            }}
          >
            ×
          </button>
        </div>
        <div 
          className="modal-body"
          style={{
            padding: '30px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 160px)', // Account for header height
            // Smooth scrolling
            scrollBehavior: 'smooth',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'scroll-position'
          }}
        >
          {Object.entries(skillCategories).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <h3>{category}</h3>
              <div className="skill-tags">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag-modal">
                    {skill}
                  </span>
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
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.2,
    triggerOnce: true
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Condensed skills for main view
  const mainSkills = [
    "JavaScript", "React", "Java", "Node.js", 
    "Spring Boot", "C#", "SQL", "Git", "CI/CD"
  ];

  return (
    <>
      <section className="about" id="about">
        <div className="about-container">
          <h2 className="section-title">About Me</h2>
          
          <div 
            className="about-content" 
            ref={ref}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}
          >
            <div className="about-image">
              <img src="images/profile.jpg" alt="Ferrin Yesudasan" />
            </div>
            
            <div className="about-text">
              <p> 
                I'm a software developer who values clarity, structure, and purpose in every line of code. 
                I stay current with modern tools and frameworks, but my focus goes deeper. 
                I care about understanding how things work, breaking down concepts, and using that insight to build software that is not just functional, but reliable, thoughtful, and well-crafted. 
              </p> 
              <p> 
                For me, good software means more than just working. It should be maintainable, efficient, and intuitive. 
                I approach development with care and discipline, whether I'm debugging complex issues or designing features from the ground up. 
                I believe in learning continuously, not just to follow trends but to improve the way I think, build, and contribute.
              </p> 
              
              <p>
                My goal is to create software that is both useful and meaningful, something that solves real problems, is easy to work with, and feels solid from the inside out. 
              </p>              
              <div className="skill-list">
                {mainSkills.map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {skill}
                  </span>
                ))}
                <button 
                  className="skill-badge view-all-skills"
                  onClick={() => setIsModalOpen(true)}
                >
                  View All Skills +
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <SkillsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

// Projects Section
function Projects() {
  const projects = [
    {
      title: "Space Shooter Game",
      description: "A space-shooter game made using JavaScript and SVG with smooth animations and interactive controls.",
      url: "https://ferrin-y.github.io/Space-Shooter/",
      image: "images/screenshots/space-shooter.png",
      tags: ["JavaScript", "SVG"]
    },
    {
      title: "Color Matching Game",
      description: "A full-stack color-matching game, built with HTML, CSS, JavaScript, and powered by a Node.js & Express backend.",
      url: "https://ferrin-y.github.io/Color-Match/",
      image: "images/screenshots/color-matcher.png",
      tags: ["JavaScript", "Node.js", "Express","SVG"]
    },    
    {
      title: "MoInfo Study Group App",
      description: "A web application to help students create and find study groups for better collaborative learning.",
      url: "https://github.com/Musa-Kal/MoInfo",
      image: "images/screenshots/mo-info.png",
      tags: ["HTML5", "CSS3", "Flask"]
    },
    {
      title: "Mooove - 3D Runner Game",
      description: "A Unity-based endless rolling game with dynamic obstacles and scoring system, hosted on itch.io.",
      url: "https://ferrin-y.itch.io/mooove",
      image: "images/screenshots/mooove.png",
      tags: ["Unity", "C#", "Blender3D"]
    },
    {
      title: "CookApp - Recipe Suggestion App",
      description: "A Java based application that helps users discover, favorite recipes based on ingredients, dietary preferences, and cuisine",
      url: "https://github.com/Ferrin-Y/CookApp",
      image: "images/screenshots/cookApp.png",
      tags: ["Java", "JavaFX", "MySQL", "Hibernate"]
    }
  ];

  // Using Intersection Observer for scroll animations
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <section className="projects" id="projects">
      <div className="projects-container">
        <h2 className="section-title">My Projects</h2>
        
        <div 
          className="project-list" 
          ref={ref}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}
        >
          {projects.map((project, index) => (
            <a
              key={index}
              className="project-card"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                "--bg-image": `url(${project.image})`,
                transitionDelay: `${index * 0.1}s` 
              }}
            >
              <div className="project-content">
                <h3>{project.title}</h3>
                <div className="project-description">{project.description}</div>
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
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
      <div className="footer-container">
        <div className="footer-col">
          <h3>About Me</h3>
          <p>Computer Science student passionate about creating innovative software solutions and web applications.</p>
          <div className="social-links">
            <a href="https://github.com/Ferrin-Y" className="social-link" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/ferrin-yesudasan" className="social-link" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#hero"><i className="fas fa-home"></i> Home</a></li>
            <li><a href="#about"><i className="fas fa-user"></i> About</a></li>
            <li><a href="#projects"><i className="fas fa-code"></i> Projects</a></li>
            <li><a href="#contact"><i className="fas fa-address-book"></i> Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h3>Contact Info</h3>
          <div className="contact-info">
            <p><a href="mailto:ferrin.yesudasan@gmail.com"><i className="fas fa-envelope"></i> ferrin.yesudasan@gmail.com</a></p>
            <p><a href="https://www.linkedin.com/in/ferrin-yesudasan" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i>Linkedin/Ferrin-Yesudasan</a></p>
            <p><a href="https://github.com/Ferrin-Y"><i className="fab fa-github"></i> github.com/Ferrin-Y</a></p>
            <p><i className="fas fa-map-marker-alt"></i>Hamilton, Ontario, Canada</p>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <p>&copy; {currentYear} Ferrin Yesudasan. All Rights Reserved.</p>
        <p className="tech-stack">Built with React</p>
      </div>
    </footer>
  );
}

// Animation for scroll to top button
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <button 
      className="scroll-to-top" 
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: 'rgb(var(--accent-color))',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: isVisible ? '1' : '0',
        transition: 'opacity 0.3s, transform 0.3s',
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        zIndex: 999
      }}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}

// Main App Component
function App() {
  // Initialize animations when the app loads
  useEffect(() => {
    // Add scroll event listener to track scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Get all animatable elements
      const animatableElements = document.querySelectorAll('.section-title, .about-content, .project-card');
      
      animatableElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top + scrollPosition;
        const offset = elementPosition - scrollPosition;
        
        if (offset < windowHeight * 0.8) {
          element.classList.add('animate');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check for elements in view
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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