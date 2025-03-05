import { Fade } from "react-awesome-reveal";
import Footer from "../components/Footer";
import "../styles/styles.css";
import "../styles/home.css";

function Blog() {
    return( 
    <>
        <div className="light-orb" style={{ '--delay': '0s' }}></div>
        <div className="light-orb" style={{ '--delay': '1s' }}></div>
        <div className="light-orb" style={{ '--delay': '2s' }}></div>
        <div className="light-orb" style={{ '--delay': '3s' }}></div>
        <div className="light-orb" style={{ '--delay': '4s' }}></div>
        <div className="light-orb" style={{ '--delay': '5s' }}></div>
        <div className="light-orb" style={{ '--delay': '6s' }}></div>
        <div className="light-orb" style={{ '--delay': '7s' }}></div>
        
        <div className="blog-container">
            <h1>
                <Fade delay={200} cascade damping={0.02}>
                    Aprende de forma sencilla y rápida con una ruta de aprendizaje hecha para ti.
                </Fade>
            </h1>
            <h2>
                <Fade delay={200} cascade damping={0.02}>
                    Conoce los estilos de aprendizaje y su importancia.
                </Fade>
            </h2>
            <div className="iframe-container">
                <iframe 
                    src="https://www.kumon.com.bo/blog/estilos-de-aprendizaje/#:~:text=En%20%C3%A9l%2C%20cada%20una%20de,%2C%20asimilador%2C%20convergente%20y%20acomodador." 
                    width="100%" 
                    height="600px" 
                    className="iframe"
                    title="Aprendizaje Visual"
                ></iframe>
            </div>
          </div>
        <Footer></Footer>
    </>
    )
}

export default Blog; 
 