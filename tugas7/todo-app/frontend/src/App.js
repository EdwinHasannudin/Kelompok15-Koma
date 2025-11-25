import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// ✅ Gunakan environment variable, fallback ke URL production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://todo-backend-479303-uc.a.run.app';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setError('');
      const response = await axios.post(`${API_BASE_URL}/api/todos`, {
        text: text.trim(),
      });
      setTodos([response.data, ...todos]);
      setText('');
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      setError('');
      const response = await axios.put(`${API_BASE_URL}/api/todos/${id}`, {
        completed: !completed,
      });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError('');
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>✅ Todo App</h1>
        <p className="api-info">Backend: {API_BASE_URL}</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
            disabled={loading}
          />
          <button type="submit" className="add-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Todo'}
          </button>
        </form>

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <span 
                  className="todo-text"
                  onClick={() => toggleTodo(todo._id, todo.completed)}
                >
                  {todo.text}
                </span>
                <button 
                  onClick={() => deleteTodo(todo._id)}
                  className="delete-button"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {todos.length === 0 && !loading && (
          <p className="empty-message">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default App;