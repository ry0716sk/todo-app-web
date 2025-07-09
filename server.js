
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TODO_FILE = path.join(__dirname, 'todos.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Helper function to read todos
const readTodos = (callback) => {
    fs.readFile(TODO_FILE, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const todos = JSON.parse(data);
            callback(null, todos);
        } catch (parseErr) {
            callback(null, []);
        }
    });
};

// Helper function to write todos
const writeTodos = (todos, callback) => {
    fs.writeFile(TODO_FILE, JSON.stringify(todos, null, 2), 'utf8', callback);
};

// API Routes
app.get('/api/todos', (req, res) => {
    readTodos((err, todos) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read todos file.' });
        }
        res.json(todos);
    });
});

app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task content is required.' });
    }

    readTodos((err, todos) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read todos file.' });
        }

        const newTodo = {
            id: Date.now(), // Simple unique ID
            task: task,
            done: false
        };

        todos.push(newTodo);

        writeTodos(todos, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to save todo.' });
            }
            res.status(201).json(newTodo);
        });
    });
});

app.put('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);
    const { done } = req.body;

    readTodos((err, todos) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read todos file.' });
        }

        const todoIndex = todos.findIndex(t => t.id === todoId);
        if (todoIndex === -1) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        todos[todoIndex].done = typeof done === 'boolean' ? done : todos[todoIndex].done;

        writeTodos(todos, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to update todo.' });
            }
            res.json(todos[todoIndex]);
        });
    });
});

app.delete('/api/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id, 10);

    readTodos((err, todos) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read todos file.' });
        }

        const newTodos = todos.filter(t => t.id !== todoId);

        if (todos.length === newTodos.length) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        writeTodos(newTodos, (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to delete todo.' });
            }
            res.status(204).send(); // No Content
        });
    });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
