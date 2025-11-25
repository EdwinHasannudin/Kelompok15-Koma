const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

// MongoDB Connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Todo Schema
const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Todo = mongoose.model('Todo', TodoSchema);

// Enhanced routes with error handling
app.get('/api/todos', async (req, res) => {
  try {
    console.log('📥 GET /api/todos');
    const todos = await Todo.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${todos.length} todos`);
    res.json(todos);
  } catch (error) {
    console.error('❌ Error fetching todos:', error);
    res.status(500).json({ 
      message: 'Failed to fetch todos',
      error: error.message 
    });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    console.log('📥 POST /api/todos:', req.body);
    
    if (!req.body.text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const todo = new Todo({ 
      text: req.body.text,
      completed: req.body.completed || false
    });
    
    const savedTodo = await todo.save();
    console.log('✅ Todo created:', savedTodo._id);
    
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('❌ Error creating todo:', error);
    res.status(500).json({ 
      message: 'Failed to create todo',
      error: error.message 
    });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    console.log(`📥 PUT /api/todos/${req.params.id}:`, req.body);
    
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { 
        completed: req.body.completed,
        text: req.body.text 
      },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    console.log('✅ Todo updated:', todo._id);
    res.json(todo);
  } catch (error) {
    console.error('❌ Error updating todo:', error);
    res.status(500).json({ 
      message: 'Failed to update todo',
      error: error.message 
    });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    console.log(`📥 DELETE /api/todos/${req.params.id}`);
    
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    console.log('✅ Todo deleted:', req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting todo:', error);
    res.status(500).json({ 
      message: 'Failed to delete todo',
      error: error.message 
    });
  }
});

// Health check with DB status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK',
    service: 'todo-backend',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo API is running 🚀',
    endpoints: {
      health: '/health',
      todos: '/api/todos'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://0.0.0.0:${PORT}/health`);
});