// Todo App with Local Storage and Time Features

class TodoApp {
    constructor() {
        this.todos = this.loadFromLocalStorage();
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.startClock();
        this.render();
        this.checkScheduledReminders();
    }

    cacheElements() {
        this.todoInput = document.getElementById('todoInput');
        this.todoTime = document.getElementById('todoTime');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskCount = document.getElementById('taskCount');
        this.clearBtn = document.getElementById('clearBtn');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.searchInput = document.getElementById('searchInput');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.completionRate = document.getElementById('completionRate');
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
        this.searchInput.addEventListener('input', (e) => this.setSearch(e.target.value));
        this.exportBtn.addEventListener('click', () => this.exportTodos());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importTodos(e));
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            this.currentTimeDisplay.textContent = timeString;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    checkScheduledReminders() {
        setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            this.todos.forEach(todo => {
                if (todo.scheduledTime === currentTime && !todo.completed && !todo.reminded) {
                    this.showNotification(`Reminder: ${todo.text}`);
                    todo.reminded = true;
                    this.saveToLocalStorage();
                }
            });
        }, 60000); // Check every minute
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Todo Reminder', { body: message });
        }
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const time = this.todoTime.value;
        
        if (text === '') {
            this.showError('Please enter a task');
            return;
        }

        if (text.length > 200) {
            this.showError('Task is too long (max 200 characters)');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            scheduledTime: time || null,
            reminded: false
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        this.todoInput.value = '';
        this.todoTime.value = '';
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
            if (!todo.completed) {
                todo.reminded = false;
            }
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

    setSearch(term) {
        this.searchTerm = term.toLowerCase();
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
        let filtered = this.todos;

        // Apply filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'scheduled':
                filtered = filtered.filter(t => t.scheduledTime && !t.completed);
                break;
        }

        // Apply search
        if (this.searchTerm) {
            filtered = filtered.filter(t => 
                t.text.toLowerCase().includes(this.searchTerm)
            );
        }

        return filtered;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">
                        ${this.searchTerm ? 'No tasks match your search' : 
                          this.currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : 
                          `No ${this.currentFilter} tasks`}
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
        const isScheduled = todo.scheduledTime && !todo.completed;
        const scheduledClass = isScheduled ? 'scheduled' : '';
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''} ${scheduledClass}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    data-id="${todo.id}"
                    ${todo.completed ? 'checked' : ''}
                >
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        <span class="todo-time${isScheduled ? ' scheduled' : ''}">
                            ${isScheduled ? '⏰ ' + todo.scheduledTime : '📅 ' + new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div class="todo-buttons">
                    <button class="todo-delete" data-id="${todo.id}">Delete</button>
                </div>
            </li>
        `;
    }

    updateTaskCount() {
        const activeTodos = this.todos.filter(t => !t.completed).length;
        const totalTodos = this.todos.length;
        const completedTodos = this.todos.filter(t => t.completed).length;
        const completionPercent = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);
        
        this.taskCount.textContent = `${activeTodos} of ${totalTodos} task${totalTodos !== 1 ? 's' : ''}`;
        this.completionRate.textContent = `${completionPercent}% complete`;
    }

    exportTodos() {
        const dataStr = JSON.stringify(this.todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importTodos(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm('This will replace your current tasks. Continue?')) {
                        this.todos = imported;
                        this.saveToLocalStorage();
                        this.render();
                        this.showError('Tasks imported successfully!');
                    }
                } else {
                    this.showError('Invalid file format');
                }
            } catch (error) {
                this.showError('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
        this.importFile.value = '';
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

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});