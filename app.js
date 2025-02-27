function Hero() {
  return (
    <section className="hero">
      <h1 className="title">
        Hi, I'm Ferrin Yesudasan
      </h1>
      <p className="subtitle">
        I'm a Computer Science student with a strong foundation in software and web development, coupled with experience in testing and quality assurance.
      </p>
      <a href="#projects" className="button">View My Work</a>
    </section>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Hero />);
