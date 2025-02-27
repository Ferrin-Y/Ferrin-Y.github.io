function Hero() {
  return (
    <section className="hero">
      <h1 className="title">Hi, I'm Ferrin Yesudasan</h1>
      <p className="subtitle">
        I'm a Computer Science student with a strong foundation in software and web development, coupled with experience in testing and quality assurance.
      </p>
      <a href="#projects" className="button">View My Work</a>
    </section>
  );
}

function About() {
  return (
    <section className="about">
      <h2>About Me</h2>
      <p>
        I'm passionate about software development, problem-solving, and continuous learning. I specialize in building dynamic web applications and enjoy exploring new technologies. With my background in computer science, I focus on writing clean, maintainable code and delivering efficient solutions.
      </p>
    </section>
  );
}

function Projects() {
  return (
    <section className="projects" id="projects">
      <h2>My Projects</h2>
      <div className="project-list">
        <div className="project-card">
          <h3>Task Management Web App</h3>
          <p>A web application to manage tasks, built with HTML, CSS, and JavaScript.</p>
        </div>
        <div className="project-card">
          <h3>3D Endless Runner Game</h3>
          <p>A fun 3D game made with Unity and C#.</p>
        </div>
        <div className="project-card">
          <h3>Color Matching Game</h3>
          <p>A colorful, interactive game built with HTML, CSS, and JavaScript.</p>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
    </>
  );
}

// React 18 Rendering
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
