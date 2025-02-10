import "../styles/styles.css";
import "../styles/home.css";
import { useState, useEffect } from "react";
import feature1 from "../assets/feature-1.svg";
import feature2 from "../assets/feature-2.svg";
import feature3 from "../assets/feature-3.svg";
import feature4 from "../assets/feature-4.svg";
import gif from "../assets/gif.gif";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Fade } from "react-awesome-reveal";

function Home() {
  const [activeIndex, setActiveIndex] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const faqData = [
    {
      question: "¿Cómo funciona?",
      answer: "Leroi analiza el contenido de los documentos subidos por los usuarios y genera un roadmap de aprendizaje jerárquico basado en los temas y subtemas identificados."
    },
    {
      question: "¿Qué tipo de documentos puedo subir?",
      answer: "Leroi acepta documentos en formato PDF."
    },
    {
      question: "¿Puedo personalizar los roadmaps generados?",
      answer: "Por ahora no, pero estamos trabajando para que los usuarios puedan ajustar los roadmaps generados por Leroi."
    }
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);
  return (
    <>
      {/* Hook*/}
      <section id="tutorial" className="hook">
        <div className="hook-content">
          <img
            src={gif}
            alt="Tutorial Placeholder"
            className="hook-gif"
          />
          <h1>
          <Fade delay={200} cascade damping={0.02}>
            Convierte tus documentos en rutas de aprendizaje personalizadas
          </Fade>
          </h1>
          <Link to={isAuthenticated ? "/roadmap" : "/register"} className="cta-button">
            {isAuthenticated ? "Generar ruta de aprendizaje" : "Sube tu primer documento"}
          </Link>
        </div>
      </section>

      {/* Features*/}
      <section className="features">
        <h2>
          <Fade delay={200} cascade damping={0.02}>
            ¿Quién es Leroi?
          </Fade>
        </h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <img src={feature1} alt="Asistente de aprendizaje" />
            </div>
            <h3>Asistente de aprendizaje</h3>
            <p>
              Leroi automatiza la creación de planes de estudio, reduciendo significativamente el tiempo dedicado a planificar qué y cómo estudiar.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={feature2} alt="Organizador" />
            </div>
            <h3>Organizador</h3>
            <p>
              Leroi identifica y organiza subtemas jerárquicamente, proporcionando un camino lógico y progresivo para el aprendizaje.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={feature3} alt="Personalizador experto" />
            </div>
            <h3>Personalizador experto</h3>
            <p>
              Leroi permite a los usuarios cargar sus propios documentos (libros, artículos, apuntes) y generar rutas de aprendizaje adaptadas a ese contenido específico.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <img src={feature4} alt="Adaptable y flexible" />
            </div>
            <h3>Adaptable y flexible</h3>
            <p>
            Los roadmaps de Leroi son ajustables según las necesidades del usuario, como plazos, etapas, y materiales adicionales. Hace que el aprendizaje sea flexible y eficiente.
            </p>
          </div>
        </div>
      </section>
      {/*Pricing*/}
      <section id= "credits" className="pricing">
        <h2>
          <Fade delay={200} cascade damping={0.02}>
            Adquiere créditos
          </Fade>
        </h2>
        <div className="pricing-container">
          <div className="pricing-card">
            <h3>Principiante</h3>
            <p className="price">250 créditos</p>
            <ul>
              <li>Ideal para probar Leroi</li>
              <li>Procesa hasta 5 documentos </li>
              <li>Descarga tus roadmaps</li>
            </ul>
            <Link to="/pricing" state={{ credits: 250 }} className="cta-button">Adquiere este plan</Link>
          </div>
          <div className="pricing-card">
            <h3>Intermedio</h3>
            <p className="price">750 créditos</p>
            <ul>
              <li>Suficiente para generar entre 5 y 8 roadmaps medianos</li>
              <li>Ideal para estudiantes </li>
              <li>Prueba funciones avanzadas</li>
            </ul>
            <Link to="/pricing" state={{ credits: 750 }} className="cta-button">Adquiere este plan</Link>
          </div>
          <div className="pricing-card">
            <h3>Avanzado</h3>
            <p className="price">1500 créditos</p>
            <ul>
              <li>Almacenamiento extensivo</li>
              <li>Procesa documentos grandes</li>
              <li>Prueba funciones experimentales</li>
            </ul>
            <Link to="/pricing" state={{ credits: 1500 }} className="cta-button">Adquiere este plan</Link>
          </div>
        </div>
      </section>

      {/* Common Questions */}
      <section id="faq" className="faq">
      <h2>
        <Fade delay={200} cascade damping={0.02}>
          Preguntas frecuentes
        </Fade>
      </h2>
      <div className="faq-container">
        {faqData.map((item, index) => (
          <div key={index} className={`faq-card ${activeIndex === index ? 'active' : ''}`}>
            <h3 onClick={() => toggleAnswer(index)} style={{ cursor: 'pointer' }}>
              {item.question}
            </h3>
            {activeIndex === index && <p>{item.answer}</p>}
          </div>
        ))}
      </div>
    </section>

      {/* El footer*/}
      <Footer />
    </>
  );
}

export default Home;
