import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import ReactFlow, { Background, Controls, ControlButton } from 'react-flow-renderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes, faSearchPlus, faSearchMinus, faExpand } from '@fortawesome/free-solid-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons'; 
import CustomNode from '../components/CustomNode';
import '../styles/roadmap.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


function GeneratedRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roadmapTopics, relatedTopics } = location.state || {};
  const [relatedTopicsModal, setRelatedTopicsModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const roadmapRef = useRef(null);
  const reactFlowInstance = useRef(null);

  const handleShowModal = () => {
    setRelatedTopicsModal(true);
    localStorage.setItem('topicsModal', 'true');
  };

  const handleNewRoadmap = () => {
    const topicState = relatedTopicsModal ? {relatedTopics} : {};
    navigate('/roadmap', {state: {topicState}});
  };

  const closeModal = () => {
    setRelatedTopicsModal(false);
  };

  const nodes = [];
  const edges = [];

  let idCounter = 0;
  const levelOffset = 600; 
  const nodeWidth = 500; 

  Object.keys(roadmapTopics).forEach((topicKey, topicIndex) => {
    const topicNode = {
      id: `topic-${idCounter++}`,
      data: { label: topicKey, color: '#ffca00' },
      position: { x: 0, y: 500},
      type: 'custom',
    };
    nodes.push(topicNode);

    const topic = roadmapTopics[topicKey];
    Object.keys(topic).forEach((subtopicKey, subtopicIndex) => {
      const subtopicNode = {
        id: `subtopic-${idCounter++}`,
        data: { label: subtopicKey, color: '#96E6B3' },
        position: { x: nodeWidth, y: topicIndex * levelOffset + subtopicIndex * levelOffset / 2 },
        type: 'custom',
      };
      nodes.push(subtopicNode);
      edges.push({ id: `e-${topicNode.id}-${subtopicNode.id}`, source: topicNode.id, target: subtopicNode.id });

      topic[subtopicKey].forEach((subSubtopic, index) => {
        const subSubtopicNode = {
          id: `subSubtopic-${idCounter++}`,
          data: { label: subSubtopic, color: '#FF92E6' },
          position: { x: nodeWidth * 2, y: topicIndex * levelOffset + subtopicIndex * levelOffset / 2 + index * 50 },
          type: 'custom',

        };
        nodes.push(subSubtopicNode);
        edges.push({ id: `e-${subtopicNode.id}-${subSubtopicNode.id}`, source: subtopicNode.id, target: subSubtopicNode.id });
      });
    });
  });

  const handleDownload = async (format) => {
    const roadmapElement = roadmapRef.current;
  
    if (format === 'json') {
      const jsonData = JSON.stringify(roadmapTopics, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roadmap.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'image' || format === 'pdf') {
      try {
        reactFlowInstance.current.fitView({ padding: 0.2, duration: 500 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const canvas = await html2canvas(roadmapElement, {
          scale: 2, 
          useCORS: true,
          logging: true,
          width: roadmapElement.scrollWidth,
          height: roadmapElement.scrollHeight,
          allowTaint: true,
        });
  
        const dataUrl = canvas.toDataURL('image/png');
  
        if (format === 'image') {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'roadmap.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (format === 'pdf') {
          const pdf = new jsPDF('landscape');
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('roadmap.pdf');
        }
      } catch (error) {
        console.error('Error al generar la imagen o PDF:', error);
      }
    }
  };
  const onInit = (instance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.2, duration: 500 });
    }, 500); 
  };

  const handleZoomIn = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomTo(reactFlowInstance.current.getZoom() + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomTo(reactFlowInstance.current.getZoom() - 0.2);
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2, duration: 500 });
    }
  };

  return (
    <div className="generated-roadmap-container">
      {roadmapTopics && (
        <>
          <button className="icon-button" onClick={() => setShowDownloadOptions(true)}>
            <FontAwesomeIcon icon={faDownload} className="download-icon" />
          </button>

          {showDownloadOptions && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-button" onClick={() => setShowDownloadOptions(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <h3>Seleccionar formato de descarga</h3>
                <div className="download-options">
                  <label className="format-option">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={selectedFormat === 'json'}
                      onChange={() => setSelectedFormat('json')}
                    />
                    <span>JSON</span>
                  </label>
                  <label className="format-option">
                    <input
                      type="radio"
                      name="format"
                      value="image"
                      checked={selectedFormat === 'image'}
                      onChange={() => setSelectedFormat('image')}
                    />
                    <span>Imagen</span>
                  </label>
                  <label className="format-option">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={selectedFormat === 'pdf'}
                      onChange={() => setSelectedFormat('pdf')}
                    />
                    <span>PDF</span>
                  </label>
                </div>
                <button className="download-button" onClick={() => handleDownload(selectedFormat)}>Descargar</button>
              </div>
            </div>
          )}

          <div className="react-flow-container" ref={roadmapRef}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={{ custom: CustomNode }}
              fit
              onInit={onInit}
            >
              <Background />
            </ReactFlow>
          </div>

          <div className="controls-container">
            <button className="control-button" onClick={handleZoomIn}>
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
            <button className="control-button" onClick={handleZoomOut}>
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
            <button className="control-button" onClick={handleFitView}>
              <FontAwesomeIcon icon={faExpand} />
            </button>
            <button className="control-button" onClick={handleShowModal}>
              <FontAwesomeIcon icon={faLink} />
          </button>
          </div>
        </>
      )}

      {relatedTopicsModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h1 className="modal-title">¿Quieres crear una ruta de un tema relacionado? 🧐</h1>
            <ul>
              {relatedTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => handleNewRoadmap()} className="modal-button">Sí 😃</button>
              <button onClick={closeModal} className="modal-button">No 🙁</button>
            </div>
          </div>
        </div>
      )}
      {relatedTopicsModal && (
        <div className="modal-overlay" onClick={closeModal}> 
          <div className="modal" onClick={(e) => e.stopPropagation()}> 
            <h1 className='modal-title'>¿Quieres crear una ruta de un tema relacionado? 🧐</h1>
            <ul>
              {relatedTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button onClick={() => handleNewRoadmap()} className='modal-button'>Sí 😃</button>
              <button onClick={closeModal} className='modal-button'>No 🙁</button> 
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeneratedRoadmap;
