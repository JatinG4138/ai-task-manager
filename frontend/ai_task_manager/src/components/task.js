import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSearchParams, useNavigate } from "react-router-dom";
import './task.css'
const TaskCreator = () => {
  const [connected, setConnected] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const navigate = useNavigate();

  const activeUser = JSON.parse(localStorage.getItem("userDetails"))


  const socket = io("http://localhost:8000", {
    transports: ["websocket"],
    withCredentials: true,
  });

  useEffect(() => {
    console.log("Connecting ...");

    socket.on("connect", () => {
      console.log("Connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      setConnected(false);
    });

    socket.on("task_added", (taskData) => {
      console.log("Task", taskData);
      setSuccessMessage('Task added successfully!');
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 2000);
      resetForm();

    });

    socket.on("task_error", (errorData) => {
      console.error("Task error:", errorData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
   
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());

  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!connected) {
      setError('Not connected');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    const taskData = {
      // token:localStorage.getItem("accessToken"),
      title,
      description,
      due_date: dueDate.toISOString().split('T')[0],
      user_id: selectedUser,
      project_id: projectId,
    };
    
    console.log('data---------------_?>>>>>', taskData);
    socket.emit('add_task', taskData);
    navigate(`/project?id=${projectId}`);
  };
  
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/get_all_users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    
  };



  return (
    <div className="task-creator">
      <h2>Create New Task</h2>
      
      {connected ? (
        <div className="connection-status connected">
          Connected to server
        </div>
      ) : (
        <div className="connection-status disconnected">
          Not connected to server
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter task title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={4}
          />
        </div>
        
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
            />
          </div>
          
        </div>
        
        <div className="form-group">
          <label htmlFor="assignUser">Assign to:</label>
          <select
            id="assignUser"
            value={selectedUser}
            onChange={handleUserChange}
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          {error && <div className="error-message">{error}</div>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !connected}
          className="submit-button"
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
      
      {tasks.length > 0 && (
        <div className="recent-tasks">
          <h3>Recently Added Tasks</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={`task-item ${task.status}`}>
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`tag ${task.tag}`}>{task.tag}</span>
                </div>
                <p className="task-due-date">Due: {task.due_date}</p>
                {task.summary && <p className="task-summary">{task.summary}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskCreator;