import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './dashboard.css'
import { useSearchParams, useNavigate } from "react-router-dom";

export const ProjectDetails = ({ user }) => {

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState([]);

  const navigate = useNavigate();
  const activeUser = JSON.parse(localStorage.getItem("userDetails"))



  const socket = io("https://ai-task-manager-2udz.onrender.com", {
    transports: ["websocket"],
    withCredentials: true,
  });

  useEffect(() => {
    console.log("Connecting ...");

    socket.on("connect", () => {
      console.log("Connected");
      // setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      // setConnected(false);
    });

    socket.on('task_status_updated', (data) => {
      setTasks(prev => prev.map(task =>
        task.id === data.id ? { ...task, status: data.status } : task
      ));
    })

    socket.on('task_deleted', (data) => {
      setTasks(prev => prev.filter(task => task.id !== data.task_id));
    })
    socket.on('task_error', (data) => {
      console.error('Socket error:', data.message);
    })

    return () => {
      socket.disconnect();
    };
  }, []);
   

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // setIsLoading(true);
        const queryParams = projectId ? `?project_id=${projectId}` : '';
        console.log(queryParams,'-------------dsadd');
      
        
        const response = await fetch(`https://ai-task-manager-2udz.onrender.com/get_project${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const result = await response.json();
        console.log(result.data)
        setProject(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const queryParams = status ? `&status=${status}` : '';
        const response = await fetch(`https://ai-task-manager-2udz.onrender.com/get_task/?project_id=${projectId}${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const result = await response.json();
        console.log(result.data)
        setTasks(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [status]);

  const getTagsClass = (taskStatus) => {
    switch (taskStatus) {
      case 'Urgent':
        return 'tag-urgent';
      case 'High':
        return 'tag-high';
      case 'Medium':
        return 'tag-medium';
      case 'Low':
        return 'tag-low';
      default:
        return '';
    }
  };

  const handleDeleteTask = (taskId) => {
    if (socket && window.confirm('Are you sure you want to delete this task?')) {
      socket.emit('delete_task', {
        id: taskId,
        user_id: 1
      });
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    if (socket) {
      socket.emit('update_task_status', {
        task_id: taskId,
        user_id: 1,
        status: newStatus
      });
    }
  };
 
  const handleAddTask = (projectId) => {
    navigate(`/task?id=${projectId}`);
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{project?.[0]?.name}</h2>
        <button 
          onClick={() => handleAddTask(project?.[0]?.id)} 
          className="edit-project-btn"
        >
          Add Task
        </button>
      </div>
      <div className="user-profile">
        <p><strong>Description:</strong> {project[0]?.description}</p>
      </div>

      <div className="task-list-card">
        <div className="task-header">
          <h3>Your Tasks</h3>
          <div className="filter-controls">
            <select 
              value={status || ''}
              onChange={(e) => setStatus(e.target.value || null)}
            >
              <option value="">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-message">Loading tasks...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="empty-message">No tasks found</div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <div className="task-content">
                  <div className="task-details">
                    <h4>{task.title}</h4>
                    <p className="task-description">Description: {task.description}</p>
                    {/* <p className="task-summary">Summary: {task.summary}</p> */}

                    
                    {task.due_date && (
                      <span className="task-due-date">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    

                  </div>
                  <div className="task-meta">
                    <div className="status-update-dropdown">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <span className={`task-status ${getTagsClass(task.tag)}`}>
                      {task.tag}
                    </span>
{/*                     
                    {task.due_date && (
                      <span className="task-due-date">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                     */}
                    <button 
                      className="delete-task-button"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
};