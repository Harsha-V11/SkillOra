
import {FaGraduationCap,FaBookOpen,FaHandshake} from "react-icons/fa";

const features = [
  {
    icon: <FaGraduationCap />,
    title: "Teach what you know",
    description:
      "Share your knowledge and help others develop new skills."
  },
  {
    icon: <FaBookOpen />,
    title: "Learn what you love",
    description:
      "Find people who can teach the skills you want to learn."
  },
  {
    icon: <FaHandshake />,
    title: "Grow together",
    description:
      "Build meaningful connections through collaborative learning."
  }
];

function Features() {
  return (
    <section className="features-section" id="features">

      <div className="section-heading">
        <span className="section-label">WHY SKILLSWAP?</span>

        <h2>
          Everything starts with <span>sharing</span>
        </h2>

        <p>
          A simple way to exchange knowledge and learn
          from people around you.
        </p>
      </div>

      <div className="feature-grid">

        {features.map((feature, index) => (
          <div className="feature-card" key={index}>

            <div className="feature-icon">
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p>{feature.description}</p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;
