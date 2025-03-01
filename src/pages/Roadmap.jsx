import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import archivo from '../assets/archivo.png';
import anim_tutorial from '../assets/Tutorial_CrearRoadmap.mp4';
import tutorial_logo from '../assets/Tutorial_logo.png';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import '../styles/roadmap.css';

function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();

  const [fileUploaded, setFileUploaded] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);  
  const [helpModal, setHelpModal] = useState(false);
  const [base64, setBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  const [previewCost, setPreviewCost] = useState("Calculando...");
  const [CanUserPay, setCanUserPay] = useState(true);
  const [topicsModal, setTopicsModal] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [roadmapTopics, setRoadmapTopics] = useState({});
  const [roadmapInfo, setRoadmapInfo] = useState({});
  const [relatedTopics, setRelatedTopics] = useState([]);
  const authToken = localStorage.getItem("token");

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  useEffect(() => {
    if (base64) {
      setPreviewFile(true);
    }
  }, [base64]);

  useEffect(() => {
    if (topics.length > 0) {
      console.log("Topics updated:", topics);
      setTopicsModal(true);
    }
  }, [topics]);

  useEffect(() => {
    const storedModalState = localStorage.getItem('topicsModal');
    if (storedModalState === 'true') {
      console.log("State:", location.state?.topicState); 
      if (location.state?.topicState) {
        setTopics(location.state.topicState.relatedTopics || []); 
      }
      setTopicsModal(true);
      localStorage.removeItem('topicsModal');
    }
  }, [location.state]);
  
  useEffect(() => {
    if (Object.keys(roadmapTopics).length > 0) {
      console.log("Roadmap Topics:", roadmapTopics);
      setLoadingPage(false);
      setLoadingText("");
      navigate('/generatedRoadmap', {state: {roadmapTopics, relatedTopics, roadmapInfo}});
    }
  }, [roadmapTopics, relatedTopics, navigate]);

  useEffect(() => {
    if (relatedTopics.length > 0) {
      console.log("Related Topics :D", relatedTopics);
    }
  }, [relatedTopics]);

  const handleFileChange = async (e) => {
    
    const file = e.target.files[0];
    const maxSize = 50 * 1024 * 1024; 

    if (file.size > maxSize) {
      toast.error('¡El archivo supera nuestras capacidades de procesamiento! Prueba eliminando algunas páginas o imagenes del archivo...');
      return;
    } else {
      setFileUploaded(file);
      convertToBase64(file);
    }

    setLoadingPage(true);
    setLoadingText("Cargando documento 🧐");
    setFileUploaded(file);
  
    try {
      const base64String = await convertToBase64(file);
      
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const newPdfDoc = await PDFDocument.create();
      const [firstPage] = await newPdfDoc.copyPages(pdfDoc, [0]); 
      newPdfDoc.addPage(firstPage);
      const pdfBytes = await newPdfDoc.save();
      const base64Page = await convertToBase64(new Blob([pdfBytes], { type: 'application/pdf' }));
      setBase64(base64Page);
      console.log("VIEJO BASE64", base64String);
      console.log("NUEVO BASE64:", base64Page);
  
      const dataToSend = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileBase64: base64Page,
      };
  
      const token = localStorage.getItem("token");
      let email = '';
      if (token) {
        try {
          if (token.split('.').length === 3) {
            const decodedPayload = token.split('.')[1];
            const decoded = atob(decodedPayload);
            const parsed = JSON.parse(decoded);
            email = parsed.sub;
          }
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          toast.error('Error al decodificar el token');
          return;
        }
      }
  
      if (!email) {
        toast.error('No se pudo obtener el correo del usuario.');
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);
  
      const previewPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/preview-cost-process-file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
  
      const analyzePromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
  
      const previewResponse = await previewPromise;
      if (!previewResponse.ok) {
        throw new Error('Error al obtener la vista previa de costos');
      }
  
      const previewResult = await previewResponse.json();
      const parsePreviewResult = JSON.parse(previewResult);

      const file_tokens = parseInt(parsePreviewResult.file_tokens);

      if (file_tokens >= 1000000) {
        toast.error('¡El archivo supera nuestras capacidades de procesamiento! Prueba eliminando algunas páginas o imagenes del archivo...');
        setFileUploaded(null);
        setPreviewCost("Calculando...");
        setShowFileInfo(false);
        return;
      }
  
      const credits_cost = parseInt(parsePreviewResult.credits_cost);
      const user_credits = parseInt(parsePreviewResult.user_credits);
  
      setPreviewCost("Costo: " + credits_cost.toLocaleString() + " Créditos");
      setUserCredits("Actualmente tienes " + user_credits.toLocaleString() + " créditos");

      setShowFileInfo(true);
  
      setCanUserPay(credits_cost > user_credits);
      if (credits_cost > user_credits) {
        toast.error('Creditos Insuficientes 😔');
      }
      analyzePromise
        .then((analyzeResponse) => {
          return analyzeResponse.json();
        })
        .then((analyzeResult) => {
          if (analyzeResult.has_virus) {
            toast.error("El archivo contiene virus. El usuario ha sido eliminado.");
          }
        })
        .catch((error) => {
          console.error('Error al analizar el archivo:', error);
        });
  
    } catch (error) {
      console.error('Error al obtener la vista previa de costos:', error);
      toast.error('Error al obtener el costo de procesamiento');
    } finally {
      setLoadingPage(false);
      setLoadingText("");
    }
  };

/*Interaccion al subir un documento*/
const [isDragging, setIsDragging] = useState(false);

const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = () => {
  setIsDragging(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFileChange({ target: { files: [file] } });
  }
};
  const handleReset = () => {
    setFileUploaded(null);
    setPreviewCost("Calculando...");
    setShowFileInfo(false);
  };

  const handleSubmitFile = async () => {
    if (!base64 || !fileUploaded) {
      toast.error("No has subido ningún archivo");
      return;
    }
  
    setLoadingPage(true);
    setLoadingText("Buscando temas relacionados... 📈🧠📚");
  
    const dataToSend = {
      fileName: fileUploaded.name,
      fileType: fileUploaded.type,
      fileSize: fileUploaded.size,
      fileBase64: base64,
    };
  
    try {
      const processResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/process-file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!processResponse.ok) {
        toast.error("No puedes generar rutas de aprendizaje de temas sensibles");
        const errorData = processResponse.json();
        throw new Error(errorData.detail);
      }
  
      const result = await processResponse.json();
      const parseResult = JSON.parse(result);
      setTopics(parseResult.themes);
  
    } catch (error) {
      console.error("Error en el proceso:", error);
      toast.error("Error al enviar los datos al backend");
    } finally {
      setIsLoading(false);
      setLoadingPage(false);
      setLoadingText("");
    }
  };

  const handleSelectedTopic = async(topic) => {  
    setTopicsModal(false);
    setLoadingPage(true);
    setLoadingText("Estamos creando tu ruta de aprendizaje 😁");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ topic }),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar el topic al backend');
      }
      
      const result = await response.json();
      console.log("Response:", result.roadmap);
      const parseResult = JSON.parse(result.roadmap);
      const parseSecondResult = JSON.parse(result.extra_info)
      console.log("VAMO A VERRRR", parseSecondResult);

      const responseTopics = await fetch(`${import.meta.env.VITE_BACKEND_URL}/related-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      const resultTopics = await responseTopics.json();
      const parseResultTopics = JSON.parse(resultTopics);

      setRelatedTopics(parseResultTopics);
      setRoadmapTopics(parseResult);    
      setRoadmapInfo(parseSecondResult);
    } catch (error) {
      console.error('Error al enviar al generar la ruta:', error);
      toast.error('No pudimos generar tu ruta de aprendizaje 😔');
    }
  };

  return (
    <>
      <div>
        {/* Sección de carga del archivo */}
        {!showFileInfo ? (
          <div className="roadmap-container">
            <h1>Sube un archivo para generar tu ruta de aprendizaje</h1>
            <div className={`file-upload ${isDragging ? 'dragging' : ''}`} onClick={() => document.getElementById('fileInput').click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              >
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <img src={archivo} alt="Icono de carga" className="upload-icon" />
              <p>{isDragging ? 'Suelta tu archivo aquí...' : 'Arrastra y suelta tu archivo PDF aquí o haz clic para subirlo (Máx 50 MB)'}</p>
            </div>
          </div>
        ) : (
          <div className="file-info-container">

            {/* Contenedor derecho: Vista previa del PDF */}
            {previewFile && base64 && (
              <div className="pdf-preview">
                {/* <h3>Vista Previa</h3> */}
                <iframe
                  src={base64 + "#toolbar=0"}
                  title="Vista previa del PDF"
                  width="100%"
                  height="100%"
                />
              </div>
            )}

            {/* Contenedor izquierdo: Detalles del archivo */}
            <div className="file-details">
                <h2>Detalles del Archivo</h2>
                <p>Nombre: {fileUploaded.name}</p>
                <p>Tamaño: {(fileUploaded.size / (1024 * 1024)).toFixed(2)} MB</p>
              <div className="credits-cost">
                <h2>Costo de procesamiento</h2>
                <p className="preview-cost-label">{previewCost}</p>
                <p className="user-credits-label">{userCredits}</p>
              </div>
              

              {/* Contenedor para los botones */}
              <div className="buttons-container">
                <button className="generate-button" onClick={handleSubmitFile} disabled={CanUserPay}>
                  {isLoading ? 'Generando tu ruta de aprendizaje...' : 'Generar ruta de aprendizaje'}
                </button>
                <button className="reset-button" onClick={handleReset}>
                  Subir otro archivo
                </button>
              </div>
            </div>

          </div>
        )}
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

      {topicsModal && (
        <div className="topics-modal">
            <h1>Temas detectados en tu archivo</h1>
              <div className="topics-content">
                {topics.map((topic, index) => (
                  <button className="topic-button" key={index} onClick={() => handleSelectedTopic(topic)}>
                    {topic}
                  </button>
                ))}
              </div>
        </div>
      )}
      {loadingPage && (
        <div className="loading-modal">
          <div className="loading-content">
            <h2>{loadingText}</h2>
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Roadmap;