const { useState } = window.React;
const ReactDOM = window.ReactDOM;

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="https://github.com/Ferrin-Y" className="logo">
        <i className="fab fa-github"></i>Ferrin-Y  {/* GitHub logo */}
        </a>
        <ul className="navbar-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>  
    </nav>
  );
}


// Hero Section
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

// About Section
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

// Projects Section
function Projects() {
  const projects = [
    {
      title: "Space Shooter Game",
      description: "A space-shooter game made using JavaScript and SVG.",
      url: "https://ferrin-y.github.io/Space-Shooter/",
    },
    {
      title: "Color Matching Game",
      description: "A fun game built with HTML, CSS, and JavaScript.",
      url: "https://ferrin-y.github.io/Color-Match/",
    },    
    {
      title: "MoInfo Study Group App",
      description: "A web app to help students create and find study groups.",
      url: "https://github.com/Musa-Kal/MoInfo",
    }
  ];

  return (
    <section className="projects" id="projects">
      <h2>My Projects</h2>
      <div className="project-list">
        {projects.map((project, index) => (
          <a
            key={index}
            className="project-card"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>{project.title}</h3>
            <div className="project-description">{project.description}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

// Footer Section
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© 2025 Ferrin Yesudasan</p>

        <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
        </ul>

        <div className="footer-links" id="contact">
          <a href="https://www.linkedin.com/in/ferrin-yesudasan" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/Ferrin-Y" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:ferrin.yesudasan@mohawkcollege.ca">Email</a>
        </div>

        <p className="tech-stack">Built with React</p>
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer />
    </>
  );
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
