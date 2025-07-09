
document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // --- API Functions ---
    const api = {
        async getTodos() {
            const response = await fetch('/api/todos');
            if (!response.ok) throw new Error('Failed to fetch todos');
            return response.json();
        },
        async addTodo(task) {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task }),
            });
            if (!response.ok) throw new Error('Failed to add todo');
            return response.json();
        },
        async updateTodo(id, done) {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done }),
            });
            if (!response.ok) throw new Error('Failed to update todo');
            return response.json();
        },
        async deleteTodo(id) {
            const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                throw new Error('Failed to delete todo');
            }
        },
    };

    // --- DOM Manipulation ---
    const renderTodos = async () => {
        try {
            const todos = await api.getTodos();
            todoList.innerHTML = '';
            if (todos.length === 0) {
                const emptyMessage = document.createElement('li');
                emptyMessage.className = 'list-group-item text-center text-muted';
                emptyMessage.textContent = 'タスクはありません。';
                todoList.appendChild(emptyMessage);
            } else {
                todos.forEach(todo => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.dataset.id = todo.id;

                    const taskSpan = document.createElement('span');
                    taskSpan.className = 'todo-task';
                    taskSpan.textContent = todo.task;
                    if (todo.done) {
                        taskSpan.classList.add('done');
                    }

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.innerHTML = '&times;'; // Multiplication sign as a cross

                    li.appendChild(taskSpan);
                    li.appendChild(deleteBtn);
                    todoList.appendChild(li);
                });
            }
        } catch (error) {
            console.error(error);
            alert('タスクの読み込みに失敗しました。');
        }
    };

    // --- Event Listeners ---
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (taskText) {
            try {
                await api.addTodo(taskText);
                todoInput.value = '';
                await renderTodos();
            } catch (error) {
                console.error(error);
                alert('タスクの追加に失敗しました。');
            }
        }
    });

    todoList.addEventListener('click', async (e) => {
        const target = e.target;
        const li = target.closest('li');
        if (!li) return;

        const id = parseInt(li.dataset.id, 10);

        if (target.classList.contains('delete-btn')) {
            try {
                await api.deleteTodo(id);
                await renderTodos();
            } catch (error) {
                console.error(error);
                alert('タスクの削除に失敗しました。');
            }
        } else if (target.classList.contains('todo-task')) {
            try {
                const isDone = target.classList.contains('done');
                await api.updateTodo(id, !isDone);
                await renderTodos();
            } catch (error) {
                console.error(error);
                alert('タスクの更新に失敗しました。');
            }
        }
    });

    // Initial render
    renderTodos();
});
