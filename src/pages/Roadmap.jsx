import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import archivo from '../assets/archivo.png';
import anim_tutorial from '../assets/Tutorial_CrearRoadmap.mp4';
import tutorial_logo from '../assets/Tutorial_logo.png';
import { toast } from 'react-hot-toast';
import '../styles/roadmap.css';

function Roadmap() {
  const [fileUploaded, setFileUploaded] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);  
  const [helpModal, setHelpModal] = useState(false);
  const [base64, setBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topicsModal, setTopicsModal] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [roadmapTopics, setRoadmapTopics] = useState({});

  const navigate = useNavigate();


  const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setBase64(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error al convertir a base64:', error);
    };
  };

  useEffect(() => {
    if (base64) {
      console.log("aca esta el base64", base64);
      setPreviewFile(true);
    }
  }, [base64]);

  useEffect(() => {
    if (fileUploaded) {
      console.log("Archivo subido:", fileUploaded.name);
    }
  }, [fileUploaded]);

  useEffect(() => {
    if (topics.length > 0) {
      console.log("Topics updated:", topics);
      setTopicsModal(true);
    }
  }, [topics]);

  useEffect(() => {
    if (Object.keys(roadmapTopics).length > 0) {
      console.log("Roadmap Topics:", roadmapTopics);
      setLoadingPage(false);
      navigate('/generatedRoadmap', {state: {roadmapTopics}});
    }
  }, [roadmapTopics, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 50 * 1024 * 1024; 

    if (file.size > maxSize) {
      toast.error('El archivo no puede ser mayor a 50 MB');
      return;
    } else {
      setFileUploaded(file);
      console.log("Archivo seleccionado:", fileUploaded);
      convertToBase64(file);
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(false);
    document.getElementById('fileInput').value = ''; 
  };

  const handleSubmitFile = async () => {
    if (!base64 || !fileUploaded) {
      toast.error("No has subido ningún archivo");
      return;
    }
  
    setIsLoading(true);
    console.log("Enviando base64:", base64);
    console.log("Enviando archivo:", fileUploaded);
  
    const dataToSend = {
      fileName: fileUploaded.name,
      fileType: fileUploaded.type,
      fileSize: fileUploaded.size,
      fileBase64: base64,
    };
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/process-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar los datos al backend');
      }
  
      const result = await response.json();
      const parseResult = JSON.parse(result);
      setTopics(parseResult);
      setIsLoading(false);

    } catch (error) {
      console.error('Error al enviar los datos:', error);
      toast.error('Error al enviar el archivo');
    }
  };

  const handleSelecteTopic = async(topic) => {  
    setTopicsModal(false);
    setLoadingPage(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el topic al backend');
      }
      const result = await response.json();
      const parseResult = JSON.parse(result);
      console.log(parseResult);
      setRoadmapTopics(parseResult);
    } catch (error) {
      console.error('Error al enviar al generar la ruta:', error);
      toast.error('No pudimos generar tu ruta de aprendizaje 😔');
    }
  };

  return (
    <>
      <div className="roadmap-container">
        <h1>Sube un archivo para generar tu ruta de aprendizaje</h1>
        <div className="file-upload" onClick={() => document.getElementById('fileInput').click()}>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <img src={archivo} alt="Icono de carga" className="upload-icon" />
          <p>{fileUploaded ? `Archivo subido: ${fileUploaded.name}` : 'Sube tu archivo pdf (max 50 MB)'}</p>
        </div>
        <button 
          className="generate-button" 
          disabled={isLoading}
          onClick={handleSubmitFile}>
            {isLoading ? 'Generando tu ruta de aprendizaje...' : 'Generar ruta de aprendizaje'}
        </button>
      </div>

      <div className="help-icon" onClick={() => setHelpModal(true)}>
        <img src={tutorial_logo} alt="Ayuda" className="tutorial-icon" />
      </div>

      {/* Modal para el tutorial en video */}
      {helpModal && (
        <div className="preview-modal">
          <div className="preview-content">
            <video width="100%" height="100%" controls autoPlay muted>
              <source src={anim_tutorial} type="video/mp4"/>
              Tu navegador no soporta la reproducción de videos.
            </video>
            <button onClick={() => setHelpModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {previewFile && base64 && (
        <div className="preview-modal">
          <div className="preview-content">
            <iframe
              src={base64}
              title="Vista previa del PDF"
              width="90%"
              height="500px"
            />
            <button onClick={handleClosePreview}>Cerrar</button>
          </div>
        </div>
      )}
      {topicsModal && (
        <div className="topics-modal">
            <h1>Temas detectados en tu archivo</h1>
              <div className="topics-content">
                {topics.map((topic, index) => (
                  <button className="topic-button" key={index} onClick={() => handleSelecteTopic(topic)}>
                    {topic}
                  </button>
                ))}
              </div>
        </div>
      )}
      {loadingPage && (
        <div className="loading-modal">
          <div className="loading-content">
            <h2>Estamos creando tu ruta de aprendizaje 😁</h2>
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Roadmap;