import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Button } from "../components/ui/Button";
import ConfirmModal from "../components/Modal";
import EditModal from "../components/EditModal";
import "../styles/profile.css";
import "../styles/modal.css";
import "../styles/editmodal.css";
import { useNavigate } from 'react-router-dom'; 

function Profile() {
  const [userData, setUserData] = useState(null);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authToken) {
        window.location.href = "/login";
        return;
      }

      try {
        // Obtener los datos del usuario
        const userResponse = await fetch(`${backendUrl}/user-profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Error al obtener los datos del usuario");
        }

        const userData = await userResponse.json();
        setUserData(userData.data);

        // Obtener los roadmaps del usuario
        const roadmapsResponse = await fetch(`${backendUrl}/user-roadmaps`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!roadmapsResponse.ok) {
          throw new Error("Error al obtener los roadmaps del usuario");
        }

        const roadmapsData = await roadmapsResponse.json();
        console.log("Roadmaps del usuario:", roadmapsData.data);
        setUserRoadmaps(roadmapsData.data);
      } catch (error) {
        console.error(error);
        window.location.href = "/login";
      }
    };

    fetchUserData();
  }, [backendUrl, authToken]);

  const handleDeleteAccount = async () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!authToken) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/delete-user/${encodeURIComponent(userData.email)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al borrar la cuenta");
      }

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al borrar la cuenta:", error);
      alert("Hubo un error al intentar borrar la cuenta.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
  };

  const handleSave = async (updatedData) => {
    const trimmedData = {
      name: updatedData.firstName.trim(),
      last_name: updatedData.lastName.trim(),
      email: userData.email?.trim(),
      provider: 'default'
    };
  
    console.log("Datos corregidos enviados al backend:", trimmedData);
  
    try {
      const response = await fetch(`${backendUrl}/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(trimmedData),
      });
  
      const result = await response.json();
      console.log("Respuesta del backend:", result);
  
      if (!response.ok) {
        throw new Error(result.detail || "Error al actualizar los datos");
      }
  
      alert("Datos actualizados correctamente");
      setUserData({ ...userData, ...updatedData });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleRoadmapClick = (roadmap) => {
    navigate('/generatedRoadmap', { state: { roadmapTopics: JSON.parse(roadmap.prompt) } });
  };

  if (!userData) {
    return <div>Cargando...</div>;
  }
  

  return (
    <div className="profile-container">
      <div className="light-orb"></div>
      <div className="light-orb"></div>
      <div className="light-orb"></div>
      <div className="light-orb"></div>
      <div className="light-orb"></div>

      <h2 className="profile-title">Perfil de Usuario</h2>

      <div className="profile-box">
        <div className="profile-image">
          <User />
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <strong>Nombre:</strong> {userData.firstName}
          </div>
          <div className="profile-field">
            <strong>Apellido:</strong> {userData.lastName}
          </div>
          <div className="profile-field">
            <strong>Email:</strong> {userData.email}
          </div>
          <div className="profile-field">
            <strong>Saldo de Créditos:</strong> ${userData.credits}
          </div>
          <div className="profile-field">
            <strong>Roadmaps Creados:</strong> {userData.roadmapsCreated}
          </div>
        </div>

        <div className="profile-footer">
          <Button
            className="edit-button"
            size="sm"
            onClick={() => setShowEditModal(true)}
          >
            Modificar datos
          </Button>
          <Button
            className="delete-button"
            size="sm"
            onClick={handleDeleteAccount}
          >
            Borrar cuenta
          </Button>
        </div>
      </div>

      {/* Sección de Roadmaps */}
      <div className="roadmaps-section">
        <h3>Roadmaps Creados</h3>
        {userRoadmaps.length > 0 ? (
          <div className="roadmaps-grid">
            {userRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id_roadmap}
                className="roadmap-card"
                onClick={() => handleRoadmapClick(roadmap)}  
              >
                <div className="roadmap-card-header">
                  <strong>{roadmap.nombre}</strong>
                </div>
                <div className="roadmap-card-body">
                  {/* Mostrar la imagen */}
                    <img
                      src={roadmap.image}
                      alt={`Imagen de ${roadmap.nombre}`}
                      className="roadmap-image"
                    />
                  <p>Creado el: {new Date(roadmap.fecha_creacion).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No has creado ningún roadmap aún.</p>
        )}
      </div>

      {showConfirmModal && (
        <ConfirmModal
          message="¿Estás seguro de que deseas borrar tu cuenta? Esta acción no se puede deshacer, y perderás el saldo de créditos que tengas en la cuenta."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showEditModal && (
        <EditModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Profile;
