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
        this.todoDate = document.getElementById('todoDate');
        this.todoTime = document.getElementById('todoTime');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.btn-filter');
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
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            this.currentTimeDisplay.textContent = timeString;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    checkScheduledReminders() {
        const checkReminders = () => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentDate = now.toISOString().split('T')[0];
            
            this.todos.forEach(todo => {
                const isTimeMatch = todo.scheduledTime === currentTime;
                const isDateMatch = !todo.scheduledDate || todo.scheduledDate === currentDate;
                
                if (isTimeMatch && isDateMatch && !todo.completed && !todo.reminded) {
                    this.showNotification(`⏰ Reminder: ${todo.text}`);
                    todo.reminded = true;
                    this.saveToLocalStorage();
                }
            });
        };
        checkReminders();
        setInterval(checkReminders, 60000);
    }

    showNotification(message) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('📋 Todo Reminder', { 
                    body: message,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">✅</text></svg>'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('📋 Todo Reminder', { body: message });
                    }
                });
            }
        } else {
            alert(message);
        }
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const date = this.todoDate.value;
        const time = this.todoTime.value;
        
        if (text === '') {
            alert('📝 Please enter a task!');
            this.todoInput.focus();
            return;
        }

        if (text.length > 200) {
            alert('⚠️ Task is too long (max 200 characters)');
            return;
        }

        if (time && !date) {
            alert('📅 Please select a date when setting a time reminder');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            scheduledDate: date || null,
            scheduledTime: time || null,
            reminded: false
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        
        this.todoInput.value = '';
        this.todoDate.value = '';
        this.todoTime.value = '';
        this.todoInput.focus();
    }

    deleteTodo(id) {
        if (confirm('🗑️ Are you sure you want to delete this task?')) {
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
            alert('✅ No completed tasks to clear');
            return;
        }

        if (confirm(`🗑️ Clear ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToLocalStorage();
            this.render();
        }
    }

    getFilteredTodos() {
        let filtered = this.todos;

        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'scheduled':
                filtered = filtered.filter(t => (t.scheduledDate || t.scheduledTime) && !t.completed);
                break;
        }

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
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">
                        ${this.searchTerm ? '🔍 No tasks match your search' : 
                          this.currentFilter === 'all' ? '✨ No tasks yet. Add one to get started!' : 
                          `📭 No ${this.currentFilter} tasks`}
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
        const isScheduled = (todo.scheduledDate || todo.scheduledTime) && !todo.completed;
        const scheduledClass = isScheduled ? 'scheduled' : '';
        
        let timeDisplay = '';
        if (isScheduled) {
            if (todo.scheduledDate && todo.scheduledTime) {
                timeDisplay = `⏰ ${todo.scheduledDate} ${todo.scheduledTime}`;
            } else if (todo.scheduledDate) {
                timeDisplay = `📅 ${todo.scheduledDate}`;
            } else if (todo.scheduledTime) {
                timeDisplay = `🕐 ${todo.scheduledTime}`;
            }
        } else {
            timeDisplay = `📅 ${new Date(todo.createdAt).toLocaleDateString()}`;
        }
        
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
                            ${timeDisplay}
                        </span>
                    </div>
                </div>
                <div class="todo-buttons">
                    <button class="btn todo-delete" data-id="${todo.id}">🗑️ Delete</button>
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
        if (this.todos.length === 0) {
            alert('📂 No tasks to export');
            return;
        }

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
                    if (confirm(`📥 Import ${imported.length} task(s)? This will replace your current tasks.`)) {
                        this.todos = imported;
                        this.saveToLocalStorage();
                        this.currentFilter = 'all';
                        this.searchTerm = '';
                        this.searchInput.value = '';
                        this.filterBtns.forEach(btn => {
                            btn.classList.toggle('active', btn.dataset.filter === 'all');
                        });
                        this.render();
                        alert(`✅ Successfully imported ${imported.length} task(s)!`);
                    }
                } else {
                    alert('❌ Invalid file format. Expected an array of tasks.');
                }
            } catch (error) {
                alert('❌ Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
        this.importFile.value = '';
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});