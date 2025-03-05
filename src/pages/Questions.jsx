import { useState } from "react";
import { useLocation } from "react-router-dom";
import '../styles/questions.css';

function Questions() {
    const location = useLocation();
    const { generatedQuestions } = location.state || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);

    const handleAnswer = (answer) => {
        const isCorrect = generatedQuestions[currentIndex].respuesta === answer;
        if (isCorrect) setScore(score + 1);
        setSelected(answer);
        setTimeout(() => {
            setSelected(null);
            setCurrentIndex((prev) => (prev + 1 < generatedQuestions.length ? prev + 1 : 0));
        }, 500);
    };

    return (
        <div className="container">
            <div className="light-orb" style={{ '--delay': '0s' }}></div>
            <div className="light-orb" style={{ '--delay': '1s' }}></div>
            <div className="light-orb" style={{ '--delay': '2s' }}></div>
            <div className="light-orb" style={{ '--delay': '3s' }}></div>
            <div className="light-orb" style={{ '--delay': '4s' }}></div>

            <div className="card">
                <h2>{generatedQuestions[currentIndex].enunciado}</h2>
                <div className="buttons">
                    <button
                        style={{ padding: "10px 20px", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", backgroundColor: selected !== null ? (generatedQuestions[currentIndex].respuesta ? "green" : "red") : "blue", color: "white", border: "none", cursor: "pointer" }}
                        onClick={() => handleAnswer(true)}
                        disabled={selected !== null}
                    >
                        Verdadero
                    </button>
                    <button
                        style={{ padding: "10px 20px", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", backgroundColor: selected !== null ? (!generatedQuestions[currentIndex].respuesta ? "green" : "red") : "red", color: "white", border: "none", cursor: "pointer" }}
                        onClick={() => handleAnswer(false)}
                        disabled={selected !== null}
                    >
                        Falso
                    </button>
                </div>
                <p style={{ textAlign: "center", marginTop: "20px" }}>Puntuación: {score}</p>
            </div>
        </div>
    );
}

export default Questions;