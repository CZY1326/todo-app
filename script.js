// Todo App with Local Storage

class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.render();
    }

    cacheElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskCount = document.getElementById('taskCount');
        this.clearBtn = document.getElementById('clearBtn');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.clearBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            this.showError('Please enter a task');
            return;
        }

        if (text.length > 100) {
            this.showError('Task is too long (max 100 characters)');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            this.render();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showError('No completed tasks to clear');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">
                        ${this.currentFilter === 'all' 
                            ? 'No tasks yet. Add one to get started!' 
                            : `No ${this.currentFilter} tasks`}
                    </div>
                </div>
            `;
        } else {
            this.todoList.innerHTML = filteredTodos
                .map(todo => this.createTodoElement(todo))
                .join('');

            this.todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleTodo(parseInt(e.target.dataset.id));
                });
            });

            this.todoList.querySelectorAll('.todo-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteTodo(parseInt(e.target.dataset.id));
                });
            });
        }

        this.updateTaskCount();
    }

    createTodoElement(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    data-id="${todo.id}"
                    ${todo.completed ? 'checked' : ''}
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="todo-delete" data-id="${todo.id}">Delete</button>
            </li>
        `;
    }

    updateTaskCount() {
        const activeTodos = this.todos.filter(t => !t.completed).length;
        const totalTodos = this.todos.length;
        this.taskCount.textContent = `${activeTodos} of ${totalTodos} task${totalTodos !== 1 ? 's' : ''}`;
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        alert(message);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});