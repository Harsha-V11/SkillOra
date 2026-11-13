
const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Register and select the skills you can teach and want to learn."
  },
  {
    number: "02",
    title: "Find your match",
    description:
      "Discover people whose teaching skills match your learning interests."
  },
  {
    number: "03",
    title: "Start learning",
    description:
      "Send a learning request, arrange a session and grow together."
  }
];

function HowItWorks() {
  return (
    <section className="how-it-works section" id="how-it-works">

      <div className="section-heading">
        <span className="section-label">THE PROCESS</span>

        <h2>How SkillSwap works</h2>

        <p>
          Start learning something new in three simple steps.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div className="step-card" key={step.number}>
            <span className="step-number">{step.number}</span>

            <h3>{step.title}</h3>

            <p>{step.description}</p>
          </div>
        ))}
      </div>

    </section>
  );
}

export default HowItWorks;
