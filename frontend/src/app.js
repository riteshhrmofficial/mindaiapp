import React, { useState, useEffect } from 'react';

function MindAI() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isSignUp, setIsSignUp] = useState(false);

  const API_URL = 'https://mindaiapp.onrender.com';

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const userMessage = { role: 'user', content: message, id: Date.now() };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (response.ok) {
        const botMessage = { role: 'assistant', content: data.message, id: Date.now() };
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, priority: 'medium' })
      });
      const data = await response.json();
      if (response.ok) {
        setTasks([...tasks, data.task]);
        setTaskTitle('');
      } else {
        setError(data.error || 'Failed to add task');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setChatHistory([]);
    setTasks([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>🧠 MindAI</h1>
          <p className="tagline">Your Intelligent AI Assistant</p>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <p className="toggle-auth">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧠 MindAI</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✓ Tasks
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="chat-container">
          <div className="chat-history">
            {chatHistory.length === 0 ? (
              <p className="empty-state">Start a conversation with MindAI!</p>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <p>{msg.content}</p>
                </div>
              ))
            )}
          </div>
          <form className="message-form" onSubmit={handleSendMessage}>
            {error && <p className="error">{error}</p>}
            <div className="input-group">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="tasks-container">
          <form className="task-form" onSubmit={handleAddTask}>
            {error && <p className="error">{error}</p>}
            <div className="input-group">
              <input
                type="text"
                placeholder="Add a new task..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks yet. Add one to get started!</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <p className="task-title">{task.title}</p>
                    <span className="task-priority">{task.priority}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MindAI;
