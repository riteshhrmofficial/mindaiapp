const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = {};
let messages = [];
let tasks = [];

// ===== AUTH ROUTES =====
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (users[email]) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  const userId = Date.now();
  users[email] = { 
    id: userId, 
    email,
    password, 
    name: name || 'User',
    createdAt: new Date()
  };
  
  res.status(201).json({
    success: true,
    user: { 
      id: userId, 
      email, 
      name: name || 'User'
    },
    token: `token-${userId}-${Date.now()}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (!users[email] || users[email].password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const user = users[email];
  res.json({
    success: true,
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    },
    token: `token-${user.id}-${Date.now()}`
  });
});

// ===== CHAT ROUTES =====
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  // Smart responses based on content
  let aiResponse = '';
  
  if (message.toLowerCase().includes('solve') || message.includes('=')) {
    // Math problem response
    aiResponse = `I'll help you solve this problem!\n\nStep 1: Identify the equation\nStep 2: Apply algebraic operations\nStep 3: Simplify both sides\nStep 4: Isolate the variable\nStep 5: Check your solution\n\nFor specific problems, please provide the equation clearly.`;
  } 
  else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    aiResponse = `Hello! 👋 I'm MindAI, your intelligent assistant. I can help you with:\n✓ Math problem solving\n✓ Task management\n✓ General questions\n✓ Writing assistance\n\nHow can I help you today?`;
  }
  else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('what can')) {
    aiResponse = `I can help you with:\n\n1️⃣ **Math Problems**: Solve equations, algebra, geometry, calculus\n2️⃣ **Task Management**: Create and organize your to-do list\n3️⃣ **Productivity**: Help you stay organized\n4️⃣ **Writing**: Assist with emails, essays, summaries\n5️⃣ **Learning**: Explain concepts and topics\n\nWhat would you like help with?`;
  }
  else {
    aiResponse = `That's an interesting question! Based on what you asked: "${message}"\n\nI can provide more detailed help if you:\n• Ask me to solve a math problem\n• Help you create a task\n• Explain a concept\n• Assist with writing\n\nFeel free to ask anything specific!`;
  }
  
  const msg = {
    id: Date.now(),
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString()
  };
  
  messages.push(msg);
  
  res.json({
    success: true,
    message: aiResponse,
    conversationId: 'conv-1',
    timestamp: new Date().toISOString()
  });
});

// ===== TASK ROUTES =====
app.post('/api/tasks', (req, res) => {
  const { title, priority, dueDate } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Task title required' });
  }
  
  const task = {
    id: Date.now(),
    title,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(task);
  
  res.status(201).json({ 
    success: true,
    task 
  });
});

app.get('/api/tasks', (req, res) => {
  res.json({ 
    success: true,
    tasks,
    total: tasks.length
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Update fields
  if (req.body.title) task.title = req.body.title;
  if (req.body.priority) task.priority = req.body.priority;
  if (req.body.dueDate) task.dueDate = req.body.dueDate;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  
  task.updatedAt = new Date().toISOString();
  
  res.json({ 
    success: true,
    task 
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const initialLength = tasks.length;
  
  tasks = tasks.filter(t => t.id !== taskId);
  
  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json({ 
    success: true,
    message: 'Task deleted'
  });
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running! ✅',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MindAI Backend API',
    version: '1.0.0',
    status: 'Running ✅',
    endpoints: {
      auth: '/api/auth/signup, /api/auth/login',
      chat: '/api/chat',
      tasks: '/api/tasks',
      health: '/health'
    }
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ MindAI Backend running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
