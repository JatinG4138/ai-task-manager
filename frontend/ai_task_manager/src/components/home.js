import React, { useState, useEffect } from 'react';
import './home.css'
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('https://ai-task-manager-2udz.onrender.com/get_project', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    
    if (!projectName.trim() || !projectDescription.trim()) {
      setError('Project name and description are required');
      return;
    }

    try {
      const response = await fetch('https://ai-task-manager-2udz.onrender.com/add_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`

        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add project');
      }

      const result = await response.json();
      
      setProjectName('');
      setProjectDescription('');
      setError('');
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectName('');
    setProjectDescription('');
    setError('');
  };

  const handleProjectClick = (project) => {
    console.log(project);
    navigate(`/project?id=${project.id}`);
    
  }

  return (
    <>
    <div className="home-page">
      <h2>Welcome to AI Task Manager</h2>
      <p>This is a simple app for Task Manager but with AI.</p>
    </div>

   <div className="project-management-container">
      <div className="project-list-header">
        <h2>Your Projects</h2>
        <button onClick={openModal} className="add-project-btn">+ Add Project</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button onClick={closeModal} className="close-modal-btn">&times;</button>
            </div>
            <form onSubmit={handleAddProject} className="project-form">
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">Project Description</label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  required
                ></textarea>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="submit-btn">Add Project</button>
            </form>
          </div>
        </div>
      )}

      <div className="project-list-section">
        {projects.length === 0 ? (
          <p className="no-projects">No projects found</p>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card" onClick={() => handleProjectClick(project)}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    
    </>
  );
}