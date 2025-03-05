// Navbar Component
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#hero" className="logo">Ferrin</a>
        <ul className="navbar-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>  
    </nav>
  );
}

// Hero Component with CSS Animations
function Hero() {
  return (
    <section className="hero" id="hero">
      <h1 className="title">Hi, I'm Ferrin Yesudasan</h1>
      <p className="subtitle">
        I'm a Computer Science student with a strong foundation in software and web development, coupled with experience in testing and quality assurance.
      </p>
      <a href="#projects" className="button">View My Work</a>
    </section>
  );
}

// About Component
function About() {
  return (
    <section className="about" id="about">
      <h2>About Me</h2>
      <p>
        I'm passionate about software development, problem-solving, and continuous learning. I specialize in building dynamic web applications and enjoy exploring new technologies. With my background in computer science, I focus on writing clean, maintainable code and delivering efficient solutions.
      </p>
    </section>
  );
}

// Projects Component with CSS Animations
function Projects() {
  return (
    <section className="projects" id="projects">
      <h2>My Projects</h2>
      <div className="project-list">
        <div className="project-card">
          <h3>MoInfo - Study Group App</h3>
          <div className="project-description">
            A web application to create and find study groups based on course codes.
          </div>
        </div>

        <div className="project-card">
          <h3>3D Runner Game</h3>
          <div className="project-description">
            A Unity-based endless runner game with custom 3D models.
          </div>
        </div>

        <div className="project-card">
          <h3>Color Matching Game</h3>
          <div className="project-description">
            A fast-paced color-matching game built using JavaScript and SVG.
          </div>
        </div>
      </div>
    </section>
    
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Copyright Info */}
        <p>© 2025 Ferrin Yesudasan</p>



        {/* Quick Navigation Links */}
        <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
        </ul>

        {/* Social Media Links */}
        <div className="footer-links" id="contact">
          <a href="https://www.linkedin.com/in/ferrin-yesudasan" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/Ferrin-Y" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:ferrin.yesudasan@mohawkcollege.ca">Email</a>
        </div>

          {/* Tech Stack Mention */}
          <p className="tech-stack">Built with React</p>
      </div>
    </footer>
  );
}




// Main App Component that combines everything
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer/>
    </>
  );
}




// React 18 Rendering
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
