
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for todos (data will not persist across serverless function invocations)
let todos = [];
let nextId = 1;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Explicitly serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task content is required.' });
    }

    const newTodo = {
        id: nextId++,
        task: task,
        done: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    const { done } = req.body;

    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found.' });
    }

    todos[todoIndex].done = typeof done === 'boolean' ? done : todos[todoIndex].done;
    res.json(todos[todoIndex]);
});

app.delete('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);

    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== todoId);

    if (todos.length === initialLength) {
        return res.status(404).json({ error: 'Todo not found.' });
    }
    res.status(204).send(); // No Content
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

