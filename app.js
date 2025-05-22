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
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = Math.min(window.innerWidth / 10, 100);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: `rgba(118, 94, 222, ${Math.random() * 0.5 + 0.1})`,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5
        }
      });
    }

    function connect() {
      const maxDistance = 150;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(118, 94, 222, ${0.2 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x = -particle.velocity.x;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y = -particle.velocity.y;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      connect();
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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

// About Section
function About() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.2,
    triggerOnce: true
  });

  const skills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "HTML5/CSS3",
  "Next.js",
  "Node.js",
  "Java",
  "Spring Boot",
  "C#",
  "PHP",
  "ASP.Net",
  "RestAPI",
  "JavaFX",
  "SQL",
  "Unity",
  "Git",
  "Hibernate ORM",
  "Responsive Design",
  "Quality Assurance",
  "Software Testing",
];

  return (
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
              I'm passionate about software development, problem-solving, and continuous learning. 
              I specialize in building dynamic web applications and enjoy exploring new technologies. 
              With my background in computer science, I focus on writing clean, maintainable code 
              and delivering efficient solutions.
            </p>
            
            <p>
              My journey in technology has equipped me with a diverse skill set, allowing me to 
              approach problems from multiple angles and find creative solutions. I'm constantly 
              learning and expanding my knowledge to stay current with industry trends.
            </p>
            
            <div className="skill-list">
              {skills.map((skill, index) => (
              <span key={index} className="skill-badge">
              {skill}
              </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
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
      description: "A fun and addictive game built with HTML, CSS, and JavaScript that tests your color recognition skills.",
      url: "https://ferrin-y.github.io/Color-Match/",
      image: "images/screenshots/color-matcher.png",
      tags: ["HTML", "JavaScript", "SVG"]
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
        backgroundColor: 'var(--accent-color)',
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